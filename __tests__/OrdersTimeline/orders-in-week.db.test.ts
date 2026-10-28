import { describe, expect, it } from 'vitest';
import { currency, customer, driver, order, status, truck } from '@/db/schemas';
import { findOrdersInWeek } from '@/lib/dal/order.dal';
import { parseWeekKey, type Week } from '@/lib/week';
import { type Transaction, withRollback } from '../db/with-rollback';

const week = (key: string) => parseWeekKey(key) as Week;

async function seed(trx: Transaction) {
  // One transaction is one client, so inserts run one after another.
  const [jan, anna] = await trx
    .insert(driver)
    .values([
      { firstName: 'Jan', lastName: 'Kowalski' },
      { firstName: 'Anna', lastName: 'Nowak' },
    ])
    .returning();
  const [dbCustomer] = await trx
    .insert(customer)
    .values({ name: 'Test Firma', tax: 'PL1234567890' })
    .returning();
  const [dbCurrency] = await trx.insert(currency).values({ code: 'PLN' }).returning();
  const [dbStatus] = await trx.insert(status).values({ name: 'w trakcie' }).returning();
  const [dbTruck] = await trx
    .insert(truck)
    .values({ plate: 'WP0997C', insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();

  let orderNr = 0;
  const addOrders = async (
    orders: { startDate: string; endDate: string; driverId?: number }[],
  ): Promise<number[]> => {
    const rows = await trx
      .insert(order)
      .values(
        orders.map((fields) => ({
          orderNr: `ZL/${++orderNr}`,
          driverId: jan.id,
          truckId: dbTruck.id,
          customerId: dbCustomer.id,
          currencyId: dbCurrency.id,
          statusId: dbStatus.id,
          priceCurrency: '100',
          pricePLN: '100',
          ...fields,
        })),
      )
      .returning({ id: order.id });

    return rows.map((row) => row.id);
  };

  return { jan, anna, addOrders };
}

const ids = (orders: { id: number }[]) => orders.map((o) => o.id);

describe('findOrdersInWeek', () => {
  it('includes an Order fully inside the Week', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      const [inside] = await addOrders([{ startDate: '2026-10-27', endDate: '2026-10-29' }]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44')))).toEqual([inside]);
    }));

  it('includes a Fri→Mon Order in both Weeks it crosses', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      const [crossing] = await addOrders([{ startDate: '2026-10-23', endDate: '2026-10-26' }]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44')))).toEqual([crossing]);
      expect(ids(await findOrdersInWeek(trx, week('2026-W43')))).toEqual([crossing]);
    }));

  it('includes an Order starting on Sunday and ending in the next Week', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      const [crossing] = await addOrders([{ startDate: '2026-11-01', endDate: '2026-11-03' }]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44')))).toEqual([crossing]);
    }));

  it('includes an Order spanning longer than the Week', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      const [spanning] = await addOrders([{ startDate: '2026-10-20', endDate: '2026-11-05' }]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44')))).toEqual([spanning]);
    }));

  it('excludes an Order ending the Sunday before the Week', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      await addOrders([{ startDate: '2026-10-22', endDate: '2026-10-25' }]);

      expect(await findOrdersInWeek(trx, week('2026-W44'))).toEqual([]);
    }));

  it('excludes an Order starting the Monday after the Week', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      await addOrders([{ startDate: '2026-11-02', endDate: '2026-11-04' }]);

      expect(await findOrdersInWeek(trx, week('2026-W44'))).toEqual([]);
    }));

  it('filters by Driver', () =>
    withRollback(async (trx) => {
      const { addOrders, anna } = await seed(trx);
      const [, annas] = await addOrders([
        { startDate: '2026-10-27', endDate: '2026-10-28' },
        { startDate: '2026-10-27', endDate: '2026-10-28', driverId: anna.id },
      ]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44'), { driverId: anna.id }))).toEqual([
        annas,
      ]);
    }));

  it('sorts by Start Date, then id', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      const [thursday, tuesdayFirst, monday, tuesdaySecond] = await addOrders([
        { startDate: '2026-10-29', endDate: '2026-10-30' },
        { startDate: '2026-10-27', endDate: '2026-10-30' },
        { startDate: '2026-10-26', endDate: '2026-10-26' },
        { startDate: '2026-10-27', endDate: '2026-10-27' },
      ]);

      expect(ids(await findOrdersInWeek(trx, week('2026-W44')))).toEqual([
        monday,
        tuesdayFirst,
        tuesdaySecond,
        thursday,
      ]);
    }));

  it('returns every Order in the Week, with no cap', () =>
    withRollback(async (trx) => {
      const { addOrders } = await seed(trx);
      await addOrders(
        Array.from({ length: 120 }, () => ({ startDate: '2026-10-28', endDate: '2026-10-28' })),
      );

      expect(await findOrdersInWeek(trx, week('2026-W44'))).toHaveLength(120);
    }));
});
