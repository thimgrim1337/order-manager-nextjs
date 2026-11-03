import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, customer, driver, loadingPlace, order, truck, unloadingPlace } from '@/db/schemas';
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
        statusId: refs.statuses.inProgress.id,
        priceCurrency: '100',
        pricePLN: '100',
      })),
    )
    .returning({ id: order.id });

  return { first: first.id, second: second.id };
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
    { orderId: first.id, placeId: zamosc.id },
    { orderId: second.id, placeId: lodz.id },
  ]);
  await trx.insert(unloadingPlace).values([
    { orderId: first.id, placeId: zgierz.id },
    { orderId: second.id, placeId: lowicz.id },
  ]);

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

const searchedIds = async (trx: dbTransaction, search: string) => {
  const { data, count } = await findOrders(trx, 0, 10, undefined, { search });
  expect(count).toBe(data.length);
  return data.map((o) => o.id);
};

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
