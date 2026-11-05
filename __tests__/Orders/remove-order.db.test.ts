import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { loadingPlace, unloadingPlace } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import { createOrder, removeOrder } from '@/lib/services/orders.services';
import { orderFormFor, seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

/** Seeds an Order with one Loading and two Unloading Places. */
async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const [, created] = await createOrder(trx, orderFormFor(refs)());
  if (!created) throw new Error('Seed Order was not created');

  return { created };
}

const orderWeek = week('2026-W44');

describe('removeOrder', () => {
  it('removes an Order with its places', () =>
    withRollback(async (trx) => {
      const { created } = await seed(trx);

      const [failure, removed] = await removeOrder(trx, created.id);

      expect(failure).toBeNull();
      expect(removed).toEqual(created);
      expect(await findOrdersInWeek(trx, orderWeek)).toEqual([]);
      expect(
        await trx.select().from(loadingPlace).where(eq(loadingPlace.orderId, created.id)),
      ).toEqual([]);
      expect(
        await trx.select().from(unloadingPlace).where(eq(unloadingPlace.orderId, created.id)),
      ).toEqual([]);
    }));

  it('reports an Order that no longer exists', () =>
    withRollback(async (trx) => {
      const { created } = await seed(trx);
      await removeOrder(trx, created.id);

      const [failure] = await removeOrder(trx, created.id);

      expect(failure).toEqual({ reason: 'NotFound' });
    }));

  it('rejects a malformed Order id', () =>
    withRollback(async (trx) => {
      await seed(trx);

      const [failure] = await removeOrder(trx, 'abc');

      expect(failure?.reason).toBe('InvalidData');
      expect(await findOrdersInWeek(trx, orderWeek)).toHaveLength(1);
    }));
});
