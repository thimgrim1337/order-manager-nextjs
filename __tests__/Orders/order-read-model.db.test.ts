import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, country } from '@/db/schemas';
import { findOrders, findOrdersInWeek, type OrderQuery } from '@/lib/dal/order.dal';
import { orderDays } from '@/lib/order-day';
import { createOrder } from '@/lib/services/orders.services';
import { withRollback } from '../db/with-rollback';
import { fakeNbp } from '../fakes/nbp';
import { orderInputFor, seedOrderReferences } from '../fixtures/order';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const orderWeek = week('2026-W44');

describe('Order read model', () => {
  it('gives the Orders Table and the Timeline the same Order', () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      await createOrder(trx, orderInputFor(refs)(), fakeNbp([]));

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

  it("gives each Loading and Unloading Place its City's Country, in the Orders Table and the Timeline", () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      const [germany] = await trx
        .insert(country)
        .values({ name: 'Niemcy', code: 'DE' })
        .returning();
      const [berlin] = await trx
        .insert(city)
        .values({ name: 'Berlin', postal: '10115', countryId: germany.id })
        .returning();
      await createOrder(
        trx,
        orderInputFor(refs)({ unloadingPlaces: [refs.cities.plock.id, berlin.id] }),
        fakeNbp([]),
      );
      const polska = { id: refs.cities.warszawa.countryId, name: 'Polska', code: 'PL' };
      const niemcy = { id: germany.id, name: 'Niemcy', code: 'DE' };

      const {
        data: [inTable],
      } = await findOrders(trx, { pageIndex: 0, pageSize: 10 });
      const [inTimeline] = await findOrdersInWeek(trx, orderWeek);

      for (const order of [inTable, inTimeline]) {
        expect(order?.loadingPlaces.map((place) => place.country)).toEqual([polska]);
        expect(order?.unloadingPlaces.map((place) => place.country)).toEqual([polska, niemcy]);
      }
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
      const days = orderDays(orderWeek, inTimeline).filter((day) => day.kind !== 'none');
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
  const orderInput = orderInputFor(refs);

  const [, gdanskToWarszawa] = await createOrder(
    trx,
    orderInput({
      loadingPlaces: [gdansk.id, warszawa.id],
      unloadingPlaces: [plock.id, warszawa.id],
    }),
    fakeNbp([]),
  );
  const [, plockToSzczecin] = await createOrder(
    trx,
    orderInput({ orderNr: 'ZL/2', loadingPlaces: [plock.id], unloadingPlaces: [szczecin.id] }),
    fakeNbp([]),
  );
  if (!gdanskToWarszawa || !plockToSzczecin) throw new Error('Seed Orders were not created');

  return { gdanskToWarszawa: gdanskToWarszawa.id, plockToSzczecin: plockToSzczecin.id };
}

const idsOf = async (trx: dbTransaction, query: Pick<OrderQuery, 'sort' | 'search'>) => {
  const { data } = await findOrders(trx, { pageIndex: 0, pageSize: 10, ...query });
  return data.map((order) => order.id);
};
