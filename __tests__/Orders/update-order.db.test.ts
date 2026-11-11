import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { toActionResponse } from '@/lib/action-response';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import type { OrderInputDto } from '@/lib/dto/order.dto';
import { createOrder, updateOrder } from '@/lib/services/orders.services';
import { withRollback } from '../db/with-rollback';
import { fakeNbp } from '../fakes/nbp';
import { orderInputFor, seedOrderReferences } from '../fixtures/order';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const orderInput = orderInputFor(refs);

  const [, created] = await createOrder(trx, orderInput(), fakeNbp([]));
  if (!created) throw new Error('Seed Order was not created');

  return { orderInput, refs, created };
}

const orderWeek = week('2026-W44');

describe('updateOrder', () => {
  it("keeps an EUR Order's stored rate while its Unloading Date and Currency hold, without asking NBP", () =>
    withRollback(async (trx) => {
      const { orderInput, refs } = await seed(trx);
      const eurForm = orderInput({ currencyId: refs.currencies.eur.id, priceCurrency: '1000' });
      const [, eurOrder] = await createOrder(
        trx,
        { ...eurForm, orderNr: 'ZL/2' },
        fakeNbp([{ no: '210/A/NBP/2026', mid: 4.2512, effectiveDate: '2026-10-28' }]),
      );
      if (!eurOrder) throw new Error('Seed EUR Order was not created');
      const nbp = fakeNbp([{ no: '210/A/NBP/2026', mid: 4.9999, effectiveDate: '2026-10-28' }]);

      const [failure, updated] = await updateOrder(
        trx,
        eurOrder.id,
        { ...eurForm, orderNr: 'ZL/2', priceCurrency: '500' },
        nbp,
      );

      expect(failure).toBeNull();
      expect(updated).toMatchObject({
        priceCurrency: '500.00',
        pricePLN: '2125.60',
        exchangeRate: '4.2512',
        exchangeDate: '2026-10-28',
      });
      expect(nbp.requests).toEqual([]);
    }));

  it("stores NBP's rate for the new Unloading Date once it changes", () =>
    withRollback(async (trx) => {
      const { orderInput, refs } = await seed(trx);
      const eurForm = orderInput({ currencyId: refs.currencies.eur.id, orderNr: 'ZL/2' });
      const [, eurOrder] = await createOrder(
        trx,
        eurForm,
        fakeNbp([{ no: '210/A/NBP/2026', mid: 4.2512, effectiveDate: '2026-10-28' }]),
      );
      if (!eurOrder) throw new Error('Seed EUR Order was not created');
      const nbp = fakeNbp([
        { no: '210/A/NBP/2026', mid: 4.2512, effectiveDate: '2026-10-28' },
        { no: '212/A/NBP/2026', mid: 4.2699, effectiveDate: '2026-10-30' },
      ]);

      // Unloading on Saturday 2026-10-31 instead of 2026-10-29.
      const [failure, updated] = await updateOrder(
        trx,
        eurOrder.id,
        { ...eurForm, endDate: '2026-10-31' },
        nbp,
      );

      expect(failure).toBeNull();
      expect(updated).toMatchObject({
        pricePLN: '4269.90',
        exchangeRate: '4.2699',
        exchangeDate: '2026-10-30',
      });
    }));

  it('reports an EUR Order NBP published no rate for, keeping the saved PLN price', () =>
    withRollback(async (trx) => {
      const { orderInput, refs, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderInput({ currencyId: refs.currencies.eur.id, priceCurrency: '500' }),
        fakeNbp([]),
      );

      expect(failure).toEqual({ reason: 'ExchangeRateNotPublished' });
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved.pricePLN).toBe('1000.00');
    }));

  it('rejects a Loading Date after the Unloading Date, keeping the saved dates', () =>
    withRollback(async (trx) => {
      const { orderInput, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderInput({ startDate: '2026-10-29', endDate: '2026-10-28' }),
        fakeNbp([]),
      );

      expect(failure?.reason).toBe('InvalidData');
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved).toMatchObject({ startDate: '2026-10-27', endDate: '2026-10-29' });
    }));

  /** The seeded Order as `seed` saved it: ZL/1, Warszawa → Płock, Gdańsk. */
  async function expectSeededOrderKept(trx: dbTransaction) {
    const [saved] = await findOrdersInWeek(trx, orderWeek);
    expect(saved).toMatchObject({ orderNr: 'ZL/1' });
    expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Warszawa']);
    expect(saved.unloadingPlaces.map((place) => place.name)).toEqual(['Płock', 'Gdańsk']);
  }

  it.each([
    ['Status', { statusId: 999999 }, 'UnknownStatus', 'Nieznany status zlecenia.'],
    ['Truck', { truckId: 999999 }, 'UnknownTruck', 'Wybrany pojazd nie istnieje.'],
    ['Driver', { driverId: 999999 }, 'UnknownDriver', 'Wybrany kierowca nie istnieje.'],
    ['Customer', { customerId: 999999 }, 'UnknownCustomer', 'Wybrany zleceniodawca nie istnieje.'],
    ['Currency', { currencyId: 999999 }, 'UnknownCurrency', 'Wybrana waluta nie istnieje.'],
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
  ][])('reports an unknown %s, keeping the saved Order', (_, fields, reason, message) =>
    withRollback(async (trx) => {
      const { orderInput, created } = await seed(trx);

      const result = await updateOrder(
        trx,
        created.id,
        orderInput({ orderNr: 'ZL/9', ...fields }),
        fakeNbp([]),
      );

      expect(result[0]).toEqual({ reason });
      expect(toActionResponse(result).message).toBe(message);
      await expectSeededOrderKept(trx);
    }));

  it.each([
    ['Loading Places', 'loadingPlaces', 'RepeatedLoadingPlace', 'Miejsce załadunku powtarza się.'],
    [
      'Unloading Places',
      'unloadingPlaces',
      'RepeatedUnloadingPlace',
      'Miejsce rozładunku powtarza się.',
    ],
  ] as const)('reports the same City twice in the %s, keeping the saved Order', (_, places, reason, message) =>
    withRollback(async (trx) => {
      const { orderInput, refs, created } = await seed(trx);
      const { warszawa, plock } = refs.cities;

      const result = await updateOrder(
        trx,
        created.id,
        orderInput({ orderNr: 'ZL/9', [places]: [warszawa.id, plock.id, warszawa.id] }),
        fakeNbp([]),
      );

      expect(result[0]).toEqual({ reason });
      expect(toActionResponse(result).message).toBe(message);
      await expectSeededOrderKept(trx);
    }));

  it('replaces the Loading and Unloading Places, in the order entered', () =>
    withRollback(async (trx) => {
      const { orderInput, refs, created } = await seed(trx);
      const { warszawa, plock, gdansk } = refs.cities;

      await updateOrder(
        trx,
        created.id,
        orderInput({ loadingPlaces: [gdansk.id], unloadingPlaces: [plock.id, warszawa.id] }),
        fakeNbp([]),
      );

      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Gdańsk']);
      expect(saved.unloadingPlaces.map((place) => place.name)).toEqual(['Płock', 'Warszawa']);
    }));

  it("re-assigns the Order's new Driver to its Truck", () =>
    withRollback(async (trx) => {
      const { orderInput, refs, created } = await seed(trx);

      await updateOrder(
        trx,
        created.id,
        orderInput({ driverId: refs.drivers.anna.id }),
        fakeNbp([]),
      );

      const [savedTruck] = await trx.select().from(truck).where(eq(truck.id, refs.truck.id));
      expect(savedTruck.driverId).toBe(refs.drivers.anna.id);
    }));

  it('invalidates cached Trucks once the Order is updated, since it assigns its Driver to its Truck', () =>
    withRollback(async (trx) => {
      const { orderInput, refs, created } = await seed(trx);
      vi.mocked(updateTag).mockClear();

      await updateOrder(
        trx,
        created.id,
        orderInput({ driverId: refs.drivers.anna.id }),
        fakeNbp([]),
      );

      expect(updateTag).toHaveBeenCalledWith('trucks');
    }));

  it('rejects a malformed Order id', () =>
    withRollback(async (trx) => {
      const { orderInput } = await seed(trx);

      const [failure] = await updateOrder(trx, 1.5, orderInput(), fakeNbp([]));

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('reports an Order that no longer exists', () =>
    withRollback(async (trx) => {
      const { orderInput, created } = await seed(trx);

      const [failure] = await updateOrder(trx, created.id + 1, orderInput(), fakeNbp([]));

      expect(failure).toEqual({ reason: 'NotFound' });
    }));
});
