import { describe, expect, it, vi } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import { changeOrderStatus, createOrder } from '@/lib/services/orders.services';
import { withRollback } from '../db/with-rollback';
import { orderFormFor, seedOrderReferences } from '../fixtures/order';
import { week } from '../utils/week';

// updateTag throws outside a Server Action.
vi.mock('next/cache', () => ({ updateTag: vi.fn(), cacheTag: vi.fn() }));

async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);

  const [, created] = await createOrder(trx, orderFormFor(refs)());
  if (!created) throw new Error('Seed Order was not created');

  return { created, delivered: refs.statuses.delivered };
}

const orderWeek = week('2026-W44');

describe('changeOrderStatus', () => {
  it("changes the Order's status and leaves its other columns untouched", () =>
    withRollback(async (trx) => {
      const { created, delivered } = await seed(trx);

      const [failure, changed] = await changeOrderStatus(trx, created.id, delivered.id);

      expect(failure).toBeNull();
      expect(changed).toEqual({ ...created, statusId: delivered.id });
    }));

  it('rejects a patch of other Order fields, leaving the Order as it was', () =>
    withRollback(async (trx) => {
      const { created, delivered } = await seed(trx);

      const [failure] = await changeOrderStatus(trx, created.id, {
        statusId: delivered.id,
        orderNr: 'ZL/HACKED',
        pricePLN: '1',
      });

      expect(failure?.reason).toBe('InvalidData');
      const [saved] = await findOrdersInWeek(trx, orderWeek);
      expect(saved).toMatchObject({
        status: { id: created.statusId },
        orderNr: 'ZL/1',
        pricePLN: '1000.00',
      });
    }));

  it('rejects a malformed Order id', () =>
    withRollback(async (trx) => {
      const { delivered } = await seed(trx);

      const [failure] = await changeOrderStatus(trx, 'abc', delivered.id);

      expect(failure?.reason).toBe('InvalidData');
    }));

  it('reports a status that does not exist', () =>
    withRollback(async (trx) => {
      const { created } = await seed(trx);

      const [failure] = await changeOrderStatus(trx, created.id, 99);

      expect(failure).toEqual({ reason: 'UnknownStatus' });
    }));

  it('reports an Order that no longer exists', () =>
    withRollback(async (trx) => {
      const { created, delivered } = await seed(trx);

      const [failure] = await changeOrderStatus(trx, created.id + 1, delivered.id);

      expect(failure).toEqual({ reason: 'NotFound' });
    }));
});
