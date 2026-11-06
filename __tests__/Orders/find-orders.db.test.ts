import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, customer, driver, loadingPlace, order, truck, unloadingPlace } from '@/db/schemas';
import type { OrderSortField } from '@/lib/consts';
import { findOrders } from '@/lib/dal/order.dal';
import type { OrderQuery } from '@/types/types';
import { seedOrderReferences } from '../db/seed';
import { withRollback } from '../db/with-rollback';

type OrderRefs = Awaited<ReturnType<typeof seedOrderReferences>>;

/** A PLN Order row in progress, 2026-10-27 → 2026-10-29, priced 100, for the given Driver, Customer and Truck. */
function orderRow(
  refs: OrderRefs,
  orderNr: string,
  ref: { driver: { id: number }; customer: { id: number }; truck: { id: number } },
) {
  return {
    orderNr,
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    driverId: ref.driver.id,
    truckId: ref.truck.id,
    customerId: ref.customer.id,
    currencyId: refs.currencies.pln.id,
    statusId: refs.statuses.inProgress.id,
    priceCurrency: '100',
    pricePLN: '100',
  };
}

/**
 * Two Orders whose ids run opposite to their names: the first is Jan Kowalski / Test Firma / WP0997C,
 * the second Anna Nowak / Alfa Trans / AB1234. Returns their ids and the seeded references.
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
    .values(orderRefs.map((ref, i) => orderRow(refs, `ZL/${i + 1}`, ref)))
    .returning({ id: order.id });

  return { first: first.id, second: second.id, refs };
}

/**
 * Two Orders named with a Z and a Polish Ł: the first is Zenon Wiśniewski / Zakład Transportowy /
 * Zamość → Zgierz, the second Łukasz Nowak / Łódzka Spedycja / Łódź → Łowicz.
 */
async function seedPolishNames(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);
  const [zenon, lukasz] = await trx
    .insert(driver)
    .values([
      { firstName: 'Zenon', lastName: 'Wiśniewski' },
      { firstName: 'Łukasz', lastName: 'Nowak' },
    ])
    .returning();
  const [zaklad, lodzka] = await trx
    .insert(customer)
    .values([
      { name: 'Zakład Transportowy', tax: 'PL1111111111' },
      { name: 'Łódzka Spedycja', tax: 'PL2222222222' },
    ])
    .returning();
  const [zamosc, zgierz, lodz, lowicz] = await trx
    .insert(city)
    .values(
      ['Zamość', 'Zgierz', 'Łódź', 'Łowicz'].map((name) => ({
        name,
        postal: '00-000',
        countryId: refs.cities.warszawa.countryId,
      })),
    )
    .returning();
  const orderRefs = [
    { driver: zenon, customer: zaklad, from: zamosc, to: zgierz },
    { driver: lukasz, customer: lodzka, from: lodz, to: lowicz },
  ];

  const [first, second] = await trx
    .insert(order)
    .values(
      orderRefs.map((ref, i) => ({
        orderNr: `ZL/${i + 1}`,
        startDate: '2026-10-27',
        endDate: '2026-10-29',
        driverId: ref.driver.id,
        truckId: refs.truck.id,
        customerId: ref.customer.id,
        currencyId: refs.currencies.pln.id,
        statusId: refs.statuses.inProgress.id,
        priceCurrency: '100',
        pricePLN: '100',
      })),
    )
    .returning({ id: order.id });
  await trx.insert(loadingPlace).values([
    { orderId: first.id, placeId: zamosc.id, position: 0 },
    { orderId: second.id, placeId: lodz.id, position: 0 },
  ]);
  await trx.insert(unloadingPlace).values([
    { orderId: first.id, placeId: zgierz.id, position: 0 },
    { orderId: second.id, placeId: lowicz.id, position: 0 },
  ]);

  return { first: first.id, second: second.id };
}

/** The ids of the first page of Orders the query finds, checking the count matches the page. */
const foundIds = async (trx: dbTransaction, query: Omit<OrderQuery, 'pageIndex' | 'pageSize'>) => {
  const { data, count } = await findOrders(trx, { pageIndex: 0, pageSize: 10, ...query });
  expect(count).toBe(data.length);
  return data.map((o) => o.id);
};

const sortedIds = (trx: dbTransaction, id: OrderSortField, desc: boolean) =>
  foundIds(trx, { sort: { id, desc } });

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

  it.each([
    ['Driver name', 'driverFullname'],
    ['Customer name', 'customerName'],
    ['Loading City', 'loadingCity'],
    ['Unloading City', 'unloadingCity'],
  ] as const)('sorts %s by the Polish alphabet: Ł comes before Z', (_, field) =>
    withRollback(async (trx) => {
      const { first, second } = await seedPolishNames(trx);

      expect(await sortedIds(trx, field, false)).toEqual([second, first]);
    }));
});

const searchedIds = (trx: dbTransaction, search: string) => foundIds(trx, { search });

describe('findOrders search', () => {
  it('finds Orders by Customer, Driver or Truck, ignoring case', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);

      expect(await searchedIds(trx, 'alfa trans')).toEqual([second]);
      expect(await searchedIds(trx, 'KOWALSKI')).toEqual([first]);
      expect(await searchedIds(trx, 'ab12')).toEqual([second]);
    }));

  it.each([
    '2026-11-02',
    '02-11-2026',
    '02/11/2026',
    '02.11.2026',
  ])('finds Orders starting or ending on the date %s', (date) =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);
      await trx
        .update(order)
        .set({ startDate: '2026-11-02', endDate: '2026-11-04' })
        .where(eq(order.id, first));
      await trx
        .update(order)
        .set({ startDate: '2026-10-30', endDate: '2026-11-02' })
        .where(eq(order.id, second));

      expect(await searchedIds(trx, date)).toEqual([first, second]);
      expect(await searchedIds(trx, '2026-11-03')).toEqual([]);
    }));

  it.each([
    '31-02-2026',
    '2026-13-45',
  ])('matches the impossible date %s as text, without a database error', (date) =>
    withRollback(async (trx) => {
      const { second } = await seed(trx);
      await trx
        .update(order)
        .set({ orderNr: `ZL/${date}` })
        .where(eq(order.id, second));

      expect(await searchedIds(trx, date)).toEqual([second]);
    }));

  it('finds Orders whose Price or PLN Price is within 1 of a number', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);
      await trx
        .update(order)
        .set({ priceCurrency: '250', pricePLN: '1062.5' })
        .where(eq(order.id, second));

      expect(await searchedIds(trx, '101')).toEqual([first]);
      expect(await searchedIds(trx, '249.5')).toEqual([second]);
      expect(await searchedIds(trx, '1063')).toEqual([second]);
      expect(await searchedIds(trx, '103')).toEqual([]);
    }));

  it('matches a term mixing letters and digits as text only', () =>
    withRollback(async (trx) => {
      const { second } = await seed(trx);

      expect(await searchedIds(trx, 'zl/2')).toEqual([second]);
      expect(await searchedIds(trx, '100 zł')).toEqual([]);
    }));
});

describe('findOrders filters', () => {
  it('includes an Order starting on the Start date filter and excludes one starting the day before', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);
      await trx.update(order).set({ startDate: '2026-10-26' }).where(eq(order.id, second));

      expect(await foundIds(trx, { startDate: '2026-10-27' })).toEqual([first]);
      expect(await foundIds(trx, { startDate: '2026-10-26' })).toEqual([first, second]);
    }));

  it('includes an Order ending on the End date filter and excludes one ending the day after', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);
      await trx.update(order).set({ endDate: '2026-10-30' }).where(eq(order.id, second));

      expect(await foundIds(trx, { endDate: '2026-10-29' })).toEqual([first]);
      expect(await foundIds(trx, { endDate: '2026-10-30' })).toEqual([first, second]);
    }));

  it('includes an Order inside the Start date to End date range and excludes one straddling it', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);
      await trx
        .update(order)
        .set({ startDate: '2026-10-25', endDate: '2026-10-28' })
        .where(eq(order.id, second));

      expect(await foundIds(trx, { startDate: '2026-10-27', endDate: '2026-10-29' })).toEqual([
        first,
      ]);
      expect(await foundIds(trx, { startDate: '2026-10-25', endDate: '2026-10-29' })).toEqual([
        first,
        second,
      ]);
    }));

  it('narrows to the Driver, and combines with Search', () =>
    withRollback(async (trx) => {
      const { first, second, refs } = await seed(trx);
      const anna = refs.drivers.anna.id;

      expect(await foundIds(trx, { driverId: anna })).toEqual([second]);
      expect(await foundIds(trx, { driverId: anna, search: 'alfa' })).toEqual([second]);
      expect(await foundIds(trx, { driverId: anna, search: 'zl/1' })).toEqual([]);
      expect(await foundIds(trx, { search: 'zl/1' })).toEqual([first]);
    }));

  it('narrows to the Status, and combines with Search', () =>
    withRollback(async (trx) => {
      const { first, second, refs } = await seed(trx);
      const { statuses } = refs;
      await trx.update(order).set({ statusId: statuses.delivered.id }).where(eq(order.id, first));

      expect(await foundIds(trx, { statusId: statuses.delivered.id })).toEqual([first]);
      expect(await foundIds(trx, { statusId: statuses.inProgress.id })).toEqual([second]);
      expect(await foundIds(trx, { statusId: statuses.delivered.id, search: 'kowalski' })).toEqual([
        first,
      ]);
      expect(await foundIds(trx, { statusId: statuses.delivered.id, search: 'nowak' })).toEqual([]);
    }));
});

describe('findOrders paging', () => {
  it('returns the requested page and the count of all matching Orders', () =>
    withRollback(async (trx) => {
      const { first, second, refs } = await seed(trx);
      const [third] = await trx
        .insert(order)
        .values(
          orderRow(refs, 'ZL/3', {
            driver: refs.drivers.jan,
            customer: refs.customer,
            truck: refs.truck,
          }),
        )
        .returning({ id: order.id });

      const page = (pageIndex: number, search?: string) =>
        findOrders(trx, { pageIndex, pageSize: 2, search });

      expect(await page(0)).toMatchObject({ count: 3, data: [{ id: first }, { id: second }] });
      expect(await page(1)).toMatchObject({ count: 3, data: [{ id: third.id }] });
      expect(await page(2)).toEqual({ count: 3, data: [] });
      expect(await page(0, 'kowalski')).toMatchObject({
        count: 2,
        data: [{ id: first }, { id: third.id }],
      });
      expect(await page(1, 'kowalski')).toEqual({ count: 2, data: [] });
    }));
});
