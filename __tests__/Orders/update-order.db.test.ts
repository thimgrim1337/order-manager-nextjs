import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { currency, truck } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import { createOrder, updateOrder } from '@/lib/services/orders.services';
import { withRollback } from '../db/with-rollback';
import { fakeNbp } from '../fakes/nbp';
import { orderFormFor, seedOrderReferences } from '../fixtures/order';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const orderForm = orderFormFor(refs);

  const [, created] = await createOrder(trx, orderForm(), fakeNbp([]));
  if (!created) throw new Error('Seed Order was not created');

  return { orderForm, refs, created };
}

const orderWeek = week('2026-W44');

describe('updateOrder', () => {
  it("keeps an EUR Order's stored rate while its Unloading Date and Currency hold, without asking NBP", () =>
    withRollback(async (trx) => {
      const { orderForm, refs } = await seed(trx);
      const eurForm = orderForm({ currencyId: refs.currencies.eur.id, priceCurrency: '1000' });
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

  it("stores NBP's rate for the new Currency once it changes", () =>
    withRollback(async (trx) => {
      const { orderForm, refs } = await seed(trx);
      // Past the seeded Currencies' ids, which leave the identity sequence where it started.
      const [usd] = await trx
        .insert(currency)
        .overridingSystemValue()
        .values({ id: 3, code: 'USD' })
        .returning();
      const eurForm = orderForm({ currencyId: refs.currencies.eur.id, orderNr: 'ZL/2' });
      const [, eurOrder] = await createOrder(
        trx,
        eurForm,
        fakeNbp([{ no: '210/A/NBP/2026', mid: 4.2512, effectiveDate: '2026-10-28' }]),
      );
      if (!eurOrder) throw new Error('Seed EUR Order was not created');
      // The fake publishes these for every Currency.
      const nbp = fakeNbp([{ no: '210/A/NBP/2026', mid: 3.6512, effectiveDate: '2026-10-28' }]);

      const [failure, updated] = await updateOrder(
        trx,
        eurOrder.id,
        { ...eurForm, currencyId: usd.id, priceCurrency: '500' },
        nbp,
      );

      expect(failure).toBeNull();
      expect(updated).toMatchObject({
        priceCurrency: '500.00',
        pricePLN: '1825.60',
        exchangeRate: '3.6512',
        exchangeDate: '2026-10-28',
      });
      expect(nbp.requests.map((request) => request.code)).toEqual(['USD']);
    }));

  it("stores NBP's rate for the new Unloading Date once it changes", () =>
    withRollback(async (trx) => {
      const { orderForm, refs } = await seed(trx);
      const eurForm = orderForm({ currencyId: refs.currencies.eur.id, orderNr: 'ZL/2' });
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
      const { orderForm, refs, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderForm({ currencyId: refs.currencies.eur.id, priceCurrency: '500' }),
        fakeNbp([]),
      );

      expect(failure).toEqual({ reason: 'ExchangeRateNotPublished' });
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved.pricePLN).toBe('1000.00');
    }));

  it('rejects a Loading Date after the Unloading Date, keeping the saved dates', () =>
    withRollback(async (trx) => {
      const { orderForm, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderForm({ startDate: '2026-10-29', endDate: '2026-10-28' }),
        fakeNbp([]),
      );

      expect(failure?.reason).toBe('InvalidData');
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved).toMatchObject({ startDate: '2026-10-27', endDate: '2026-10-29' });
    }));

  it('replaces the Loading and Unloading Places, in the order entered', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);
      const { warszawa, plock, gdansk } = refs.cities;

      await updateOrder(
        trx,
        created.id,
        orderForm({ loadingPlaces: [gdansk], unloadingPlaces: [plock, warszawa] }),
        fakeNbp([]),
      );

      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Gdańsk']);
      expect(saved.unloadingPlaces.map((place) => place.name)).toEqual(['Płock', 'Warszawa']);
    }));

  it("re-assigns the Order's new Driver to its Truck", () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);

      await updateOrder(
        trx,
        created.id,
        orderForm({ driverId: refs.drivers.anna.id }),
        fakeNbp([]),
      );

      const [savedTruck] = await trx.select().from(truck).where(eq(truck.id, refs.truck.id));
      expect(savedTruck.driverId).toBe(refs.drivers.anna.id);
    }));

  it('invalidates cached Trucks once the Order is updated, since it assigns its Driver to its Truck', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);
      vi.mocked(updateTag).mockClear();

      await updateOrder(
        trx,
        created.id,
        orderForm({ driverId: refs.drivers.anna.id }),
        fakeNbp([]),
      );

      expect(updateTag).toHaveBeenCalledWith('trucks');
    }));

  it('rejects a malformed Order id', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);

      const [failure] = await updateOrder(trx, 1.5, orderForm(), fakeNbp([]));

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('reports an Order that no longer exists', () =>
    withRollback(async (trx) => {
      const { orderForm, created } = await seed(trx);

      const [failure] = await updateOrder(trx, created.id + 1, orderForm(), fakeNbp([]));

      expect(failure).toEqual({ reason: 'NotFound' });
    }));
});
