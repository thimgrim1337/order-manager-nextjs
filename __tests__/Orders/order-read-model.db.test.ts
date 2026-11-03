import { describe, expect, it, vi } from 'vitest';
import { findOrders, findOrdersInWeek } from '@/lib/dal/order.dal';
import { createOrder } from '@/lib/services/orders.services';
import { parseWeekKey, type Week } from '@/lib/week';
import { orderFormFor, seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

const week = parseWeekKey('2026-W44') as Week;

describe('Order read model', () => {
  it('gives the Orders Table and the Timeline the same Order', () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      await createOrder(trx, orderFormFor(refs)());

      const {
        data: [inTable],
      } = await findOrders(trx, 0, 10);
      const [inTimeline] = await findOrdersInWeek(trx, week);

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
});
