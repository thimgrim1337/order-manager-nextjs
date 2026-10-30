import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import { createOrder, updateOrder } from '@/lib/orders';
import { parseWeekKey, type Week } from '@/lib/week';
import { orderFormFor, seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const orderForm = orderFormFor(refs);

  const [, created] = await createOrder(trx, orderForm());
  if (!created) throw new Error('Seed Order was not created');

  return { orderForm, refs, created };
}

const week = parseWeekKey('2026-W44') as Week;

describe('updateOrder', () => {
  it('recomputes the PLN price when the price and currency change to EUR', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);

      const [failure, updated] = await updateOrder(
        trx,
        created.id,
        orderForm({
          currencyId: refs.currencies.eur.id,
          priceCurrency: '500',
          currencyInfo: { rate: '4.2512', table: '210/A/NBP/2026', date: '2026-10-28' },
        }),
      );

      expect(failure).toBeNull();
      expect(updated).toMatchObject({
        priceCurrency: '500.00',
        pricePLN: '2125.60',
        exchangeRate: '4.2512',
        exchangeDate: '2026-10-28',
      });
    }));

  it('rejects an EUR price without an exchange rate, keeping the saved PLN price', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderForm({ currencyId: refs.currencies.eur.id, priceCurrency: '500' }),
      );

      expect(failure?.reason).toBe('InvalidData');
      const [saved] = await findOrdersInWeek(trx, week);
      expect(saved.pricePLN).toBe('1000.00');
    }));

  it('rejects a Loading Date after the Unloading Date, keeping the saved dates', () =>
    withRollback(async (trx) => {
      const { orderForm, created } = await seed(trx);

      const [failure] = await updateOrder(
        trx,
        created.id,
        orderForm({ startDate: '2026-10-29', endDate: '2026-10-28' }),
      );

      expect(failure?.reason).toBe('InvalidData');
      const [saved] = await findOrdersInWeek(trx, week);
      expect(saved).toMatchObject({ startDate: '2026-10-27', endDate: '2026-10-29' });
    }));

  it('replaces the Loading and Unloading Places', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);
      const { warszawa, plock, gdansk } = refs.cities;

      await updateOrder(
        trx,
        created.id,
        orderForm({ loadingPlaces: [gdansk], unloadingPlaces: [warszawa, plock] }),
      );

      const [saved] = await findOrdersInWeek(trx, week);
      expect(saved.loadingPlaces.map((place) => place.name)).toEqual(['Gdańsk']);
      expect(saved.unloadingPlaces.map((place) => place.name).sort()).toEqual([
        'Płock',
        'Warszawa',
      ]);
    }));

  it("re-assigns the Order's new Driver to its Truck", () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);

      await updateOrder(trx, created.id, orderForm({ driverId: refs.drivers.anna.id }));

      const [savedTruck] = await trx.select().from(truck).where(eq(truck.id, refs.truck.id));
      expect(savedTruck.driverId).toBe(refs.drivers.anna.id);
    }));

  it('invalidates cached Trucks once the Order is updated, since it assigns its Driver to its Truck', () =>
    withRollback(async (trx) => {
      const { orderForm, refs, created } = await seed(trx);
      vi.mocked(updateTag).mockClear();

      await updateOrder(trx, created.id, orderForm({ driverId: refs.drivers.anna.id }));

      expect(updateTag).toHaveBeenCalledWith('trucks');
    }));

  it('rejects a malformed Order id', () =>
    withRollback(async (trx) => {
      const { orderForm } = await seed(trx);

      const [failure] = await updateOrder(trx, 1.5, orderForm());

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('reports an Order that no longer exists', () =>
    withRollback(async (trx) => {
      const { orderForm, created } = await seed(trx);

      const [failure] = await updateOrder(trx, created.id + 1, orderForm());

      expect(failure).toEqual({ reason: 'NotFound' });
    }));
});
