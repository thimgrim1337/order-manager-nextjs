import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { customer, order, truck } from '@/db/schemas';
import type { OrderSortField } from '@/lib/consts';
import { findOrders } from '@/lib/dal/order.dal';
import { seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';

/**
 * Two Orders whose ids run opposite to their names: the first is Jan Kowalski / Test Firma / WP0997C,
 * the second Anna Nowak / Alfa Trans / AB1234.
 */
async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);
  const [alfaTrans] = await trx
    .insert(customer)
    .values({ name: 'Alfa Trans', tax: 'PL0987654321' })
    .returning();
  const [ab1234] = await trx
    .insert(truck)
    .values({ plate: 'AB1234', insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();
  const orderRefs = [
    { driver: refs.drivers.jan, customer: refs.customer, truck: refs.truck },
    { driver: refs.drivers.anna, customer: alfaTrans, truck: ab1234 },
  ];

  const [first, second] = await trx
    .insert(order)
    .values(
      orderRefs.map((ref, i) => ({
        orderNr: `ZL/${i + 1}`,
        startDate: '2026-10-27',
        endDate: '2026-10-29',
        driverId: ref.driver.id,
        truckId: ref.truck.id,
        customerId: ref.customer.id,
        currencyId: refs.currencies.pln.id,
        statusId: refs.status.id,
        priceCurrency: '100',
        pricePLN: '100',
      })),
    )
    .returning({ id: order.id });

  return { first: first.id, second: second.id };
}

const sortedIds = async (trx: dbTransaction, id: OrderSortField, desc: boolean) => {
  const { data } = await findOrders(trx, 0, 10, [{ id, desc }]);
  return data.map((o) => o.id);
};

describe('findOrders sorting', () => {
  it.each([
    ['Driver name', 'driverFullname'],
    ['Customer name', 'customerName'],
    ['Truck plate', 'truckPlate'],
  ] as const)('sorts by %s, asc and desc', (_, field) =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);

      expect(await sortedIds(trx, field, false)).toEqual([second, first]);
      expect(await sortedIds(trx, field, true)).toEqual([first, second]);
    }));
});
