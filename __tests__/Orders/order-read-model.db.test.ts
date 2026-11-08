import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city } from '@/db/schemas';
import { findOrders, findOrdersInWeek } from '@/lib/dal/order.dal';
import { orderDays } from '@/lib/order-day';
import { createOrder } from '@/lib/services/orders.services';
import type { OrderQuery } from '@/types/types';
import { orderFormFor, seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const orderWeek = week('2026-W44');

describe('Order read model', () => {
  it('gives the Orders Table and the Timeline the same Order', () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      await createOrder(trx, orderFormFor(refs)());

      const {
        data: [inTable],
      } = await findOrders(trx, { pageIndex: 0, pageSize: 10 });
      const [inTimeline] = await findOrdersInWeek(trx, orderWeek);

      expect(inTable).toEqual(inTimeline);
      expect(Object.keys(inTable).sort()).toEqual([
        'currency',
        'customer',
        'driver',
        'endDate',
        'id',
        'loadingPlaces',
        'orderNr',
        'priceCurrency',
        'pricePLN',
        'startDate',
        'status',
        'truck',
        'unloadingPlaces',
      ]);
    }));

  it('agrees on the first Loading Place and last Unloading Place entered, whatever the City ids', () =>
    withRollback(async (trx) => {
      const { gdanskToWarszawa, plockToSzczecin } = await seedOutOfIdOrder(trx);

      const {
        data: [inTable],
      } = await findOrders(trx, { pageIndex: 0, pageSize: 10, search: 'ZL/1' });
      expect(inTable?.loadingPlaces.map((place) => place.name)).toEqual(['Gdańsk', 'Warszawa']);
      expect(inTable?.unloadingPlaces.map((place) => place.name)).toEqual(['Płock', 'Warszawa']);

      const inTimeline = (await findOrdersInWeek(trx, orderWeek)).find(
        (order) => order.id === gdanskToWarszawa,
      );
      if (!inTimeline) throw new Error('Order missing from the Timeline');
      const days = orderDays(orderWeek, inTimeline, []).filter((day) => day.kind !== 'none');
      expect(days.at(0)?.loadingPlace?.name).toBe('Gdańsk');
      expect(days.at(-1)?.unloadingPlace?.name).toBe('Warszawa');

      // Gdańsk loads before Płock; Szczecin unloads before Warszawa.
      expect(await idsOf(trx, { sort: { id: 'loadingCity', desc: false } })).toEqual([
        gdanskToWarszawa,
        plockToSzczecin,
      ]);
      expect(await idsOf(trx, { sort: { id: 'unloadingCity', desc: false } })).toEqual([
        plockToSzczecin,
        gdanskToWarszawa,
      ]);

      expect(await idsOf(trx, { search: 'gdańsk' })).toEqual([gdanskToWarszawa]);
      expect(await idsOf(trx, { search: 'płock' })).toEqual([plockToSzczecin]);
    }));
});

/**
 * An Order loading in Gdańsk, Warszawa and unloading in Płock, Warszawa, whose first Loading Place
 * has the higher City id and last Unloading Place the lowest; and another, Płock → Szczecin.
 */
async function seedOutOfIdOrder(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);
  const { warszawa, plock, gdansk } = refs.cities;
  const [szczecin] = await trx
    .insert(city)
    .values({ name: 'Szczecin', postal: '70-001', countryId: warszawa.countryId })
    .returning();
  const orderForm = orderFormFor(refs);

  const [, gdanskToWarszawa] = await createOrder(
    trx,
    orderForm({ loadingPlaces: [gdansk, warszawa], unloadingPlaces: [plock, warszawa] }),
  );
  const [, plockToSzczecin] = await createOrder(
    trx,
    orderForm({ orderNr: 'ZL/2', loadingPlaces: [plock], unloadingPlaces: [szczecin] }),
  );
  if (!gdanskToWarszawa || !plockToSzczecin) throw new Error('Seed Orders were not created');

  return { gdanskToWarszawa: gdanskToWarszawa.id, plockToSzczecin: plockToSzczecin.id };
}

const idsOf = async (trx: dbTransaction, query: Pick<OrderQuery, 'sort' | 'search'>) => {
  const { data } = await findOrders(trx, { pageIndex: 0, pageSize: 10, ...query });
  return data.map((order) => order.id);
};
