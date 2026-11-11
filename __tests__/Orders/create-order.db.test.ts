import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { toActionResponse } from '@/lib/action-response';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import type { OrderInputDto } from '@/lib/dto/order.dto';
import { createOrder } from '@/lib/services/orders.services';
import { withRollback } from '../db/with-rollback';
import { fakeNbp } from '../fakes/nbp';
import { orderInputFor, seedOrderReferences } from '../fixtures/order';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const orderInput = orderInputFor(refs);

  return { orderInput, refs, eur: refs.currencies.eur, dbTruck: refs.truck };
}

const orderWeek = week('2026-W44');

describe('createOrder', () => {
  beforeEach(() => {
    vi.mocked(updateTag).mockClear();
    // NBP's rate depends on today; after every Unloading Date below but the one passed `now`.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-04T10:00:00+01:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves the Loading and Unloading Places in the order entered', () =>
    withRollback(async (trx) => {
      const { orderInput, refs } = await seed(trx);

      const { warszawa, plock, gdansk } = refs.cities;

      // Gdańsk has a higher City id than Płock.
      const [failure, created] = await createOrder(
        trx,
        orderInput({ loadingPlaces: [warszawa.id], unloadingPlaces: [gdansk.id, plock.id] }),
        fakeNbp([]),
      );

      expect(failure).toBeNull();
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved.id).toBe(created?.id);
      expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Warszawa']);
      expect(saved.unloadingPlaces.map((place) => place.name)).toEqual(['Gdańsk', 'Płock']);
    }));

  it("assigns the Order's Driver to its Truck", () =>
    withRollback(async (trx) => {
      const { orderInput, refs, dbTruck } = await seed(trx);
      const { anna } = refs.drivers;

      // The Truck's Regular Driver is Jan.
      await createOrder(trx, orderInput({ driverId: anna.id }), fakeNbp([]));

      const [savedTruck] = await trx.select().from(truck).where(eq(truck.id, dbTruck.id));
      expect(savedTruck.driverId).toBe(anna.id);
    }));

  it("stores NBP's rate for its Unloading Date", () =>
    withRollback(async (trx) => {
      const { orderInput, eur } = await seed(trx);
      const nbp = fakeNbp([
        { no: '209/A/NBP/2026', mid: 4.2401, effectiveDate: '2026-10-27' },
        { no: '210/A/NBP/2026', mid: 4.2512, effectiveDate: '2026-10-28' },
        { no: '211/A/NBP/2026', mid: 4.2699, effectiveDate: '2026-10-29' },
      ]);

      // Unloading on 2026-10-29.
      const [failure, created] = await createOrder(
        trx,
        orderInput({
          currencyId: eur.id,
          priceCurrency: '1000',
        }),
        nbp,
      );

      expect(failure).toBeNull();
      expect(created).toMatchObject({
        priceCurrency: '1000.00',
        pricePLN: '4251.20',
        exchangeRate: '4.2512',
        exchangeDate: '2026-10-28',
      });
    }));

  it("stores NBP's latest rate by the company's day for an Unloading Date after it", () =>
    withRollback(async (trx) => {
      const { orderInput, eur } = await seed(trx);
      const nbp = fakeNbp(
        [
          { no: '203/A/NBP/2026', mid: 4.2333, effectiveDate: '2026-10-20' },
          { no: '204/A/NBP/2026', mid: 4.2444, effectiveDate: '2026-10-21' },
        ],
        '2026-10-21',
      );
      // 00:30 on 2026-10-21 in Warsaw, still 2026-10-20 in UTC.
      const now = new Date('2026-10-20T22:30:00Z');

      // Unloading on 2026-10-29.
      const [, created] = await createOrder(
        trx,
        orderInput({ currencyId: eur.id, priceCurrency: '1000' }),
        nbp,
        now,
      );

      expect(created).toMatchObject({ exchangeRate: '4.2444', exchangeDate: '2026-10-21' });
    }));

  it('rounds a PLN price on half a grosz up', () =>
    withRollback(async (trx) => {
      const { orderInput, eur } = await seed(trx);
      const nbp = fakeNbp([{ no: '210/A/NBP/2026', mid: 4.1235, effectiveDate: '2026-10-28' }]);

      const [, created] = await createOrder(
        trx,
        orderInput({ currencyId: eur.id, priceCurrency: '1070' }),
        nbp,
      );

      // 4412.145 exactly; floating point makes it 4412.1449999999995.
      expect(created?.pricePLN).toBe('4412.15');
    }));

  it('creates a PLN Order without asking NBP', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);
      const nbp = fakeNbp([]);

      const [failure, created] = await createOrder(trx, orderInput({ priceCurrency: '1000' }), nbp);

      expect(failure).toBeNull();
      expect(created).toMatchObject({ pricePLN: '1000.00', exchangeRate: '1.0000' });
      expect(nbp.requests).toEqual([]);
    }));

  it('reports an EUR Order NBP published no rate for, and saves nothing', () =>
    withRollback(async (trx) => {
      const { orderInput, eur } = await seed(trx);

      const result = await createOrder(
        trx,
        orderInput({ currencyId: eur.id, priceCurrency: '1000' }),
        fakeNbp([]),
      );

      expect(result[0]).toEqual({ reason: 'ExchangeRateNotPublished' });
      expect(toActionResponse(result).message).toBe('Nie znaleziono kursu dla wskazanej daty.');
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(0);
    }));

  it('reports an unknown Currency, and saves nothing', () =>
    withRollback(async (trx) => {
      const { orderInput, eur } = await seed(trx);

      const result = await createOrder(trx, orderInput({ currencyId: eur.id + 100 }), fakeNbp([]));

      expect(result[0]).toEqual({ reason: 'UnknownCurrency' });
      expect(toActionResponse(result).message).toBe('Wybrana waluta nie istnieje.');
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(0);
    }));

  it.each([
    ['Status', { statusId: 999999 }, 'UnknownStatus', 'Nieznany status zlecenia.'],
    ['Truck', { truckId: 999999 }, 'UnknownTruck', 'Wybrany pojazd nie istnieje.'],
    ['Driver', { driverId: 999999 }, 'UnknownDriver', 'Wybrany kierowca nie istnieje.'],
    ['Customer', { customerId: 999999 }, 'UnknownCustomer', 'Wybrany zleceniodawca nie istnieje.'],
    [
      'Loading City',
      { loadingPlaces: [999999] },
      'UnknownCity',
      'Wybrana miejscowość nie istnieje.',
    ],
    [
      'Unloading City',
      { unloadingPlaces: [999999] },
      'UnknownCity',
      'Wybrana miejscowość nie istnieje.',
    ],
  ] satisfies [
    string,
    Partial<OrderInputDto>,
    string,
    string,
  ][])('reports an unknown %s, and saves nothing', (_, fields, reason, message) =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      const result = await createOrder(trx, orderInput(fields), fakeNbp([]));

      expect(result[0]).toEqual({ reason });
      expect(toActionResponse(result).message).toBe(message);
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(0);
    }));

  it.each([
    ['Loading Places', 'loadingPlaces', 'RepeatedLoadingPlace', 'Miejsce załadunku powtarza się.'],
    [
      'Unloading Places',
      'unloadingPlaces',
      'RepeatedUnloadingPlace',
      'Miejsce rozładunku powtarza się.',
    ],
  ] as const)('reports the same City twice in the %s, and saves nothing', (_, places, reason, message) =>
    withRollback(async (trx) => {
      const { orderInput, refs } = await seed(trx);
      const { warszawa, plock } = refs.cities;

      const result = await createOrder(
        trx,
        orderInput({ [places]: [warszawa.id, plock.id, warszawa.id] }),
        fakeNbp([]),
      );

      expect(result[0]).toEqual({ reason });
      expect(toActionResponse(result).message).toBe(message);
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(0);
    }));

  it('reports an Order Number already used for the Customer, and saves nothing', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);
      await createOrder(trx, orderInput({ orderNr: 'ZL/7' }), fakeNbp([]));

      const [failure] = await createOrder(trx, orderInput({ orderNr: 'ZL/7' }), fakeNbp([]));

      expect(failure).toEqual({ reason: 'OrderNrTaken' });
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(1);
    }));

  it('rejects a Loading Date after the Unloading Date, and saves nothing', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      const [failure] = await createOrder(
        trx,
        orderInput({ startDate: '2026-10-29', endDate: '2026-10-28' }),
        fakeNbp([]),
      );

      expect(failure?.reason).toBe('InvalidData');
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(0);
    }));

  it('invalidates cached Orders once the Order is created', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      await createOrder(trx, orderInput(), fakeNbp([]));

      expect(updateTag).toHaveBeenCalledWith('orders');
    }));

  it('invalidates cached Trucks once the Order is created, since it assigns its Driver to its Truck', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      await createOrder(trx, orderInput(), fakeNbp([]));

      expect(updateTag).toHaveBeenCalledWith('trucks');
    }));

  it('invalidates nothing when the Order is not created', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      await createOrder(trx, orderInput({ orderNr: '' }), fakeNbp([]));

      expect(updateTag).not.toHaveBeenCalled();
    }));
});
