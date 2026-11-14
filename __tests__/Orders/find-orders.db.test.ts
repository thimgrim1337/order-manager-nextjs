import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import type { dbTransaction } from '@/db/db';
import { city, customer, driver, order, truck } from '@/db/schemas';
import { findOrders, type OrderQuery, type OrderSortField } from '@/lib/dal/order.dal';
import { withRollback } from '../db/with-rollback';
import { orderRowFor, seedOrder, seedOrderReferences } from '../fixtures/order';

/**
 * Two Orders whose ids run opposite to their names: the first is Jan Kowalski / Test Firma / WP0997C,
 * the second Anna Nowak / Alfa Trans / AB1234. Returns their ids and the seeded references.
 */
async function seed(trx: dbTransaction) {
  const refs = await seedOrderReferences(trx);
  const [alfaTrans] = await trx
    .insert(customer)
    .values({ name: 'Alfa Trans', tax: '0987654327' })
    .returning();
  const [ab1234] = await trx
    .insert(truck)
    .values({ plate: 'AB1234', insuranceEndAt: '2027-01-01', serviceEndAt: '2027-01-01' })
    .returning();
  const orderRow = orderRowFor(refs);
  const [first, second] = await trx
    .insert(order)
    .values([
      orderRow(),
      orderRow({
        orderNr: 'ZL/2',
        driverId: refs.drivers.anna.id,
        customerId: alfaTrans.id,
        truckId: ab1234.id,
      }),
    ])
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
      { name: 'Zakład Transportowy', tax: '1111111111' },
      { name: 'Łódzka Spedycja', tax: '2222222222' },
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
  const first = await seedOrder(trx, refs, {
    driverId: zenon.id,
    customerId: zaklad.id,
    loadingPlaces: [zamosc],
    unloadingPlaces: [zgierz],
  });
  const second = await seedOrder(trx, refs, {
    orderNr: 'ZL/2',
    driverId: lukasz.id,
    customerId: lodzka.id,
    loadingPlaces: [lodz],
    unloadingPlaces: [lowicz],
  });

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

  it('sorts by Driver first name, then last name: every Jan before every Jana', () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      // Inserted out of order, so the id tie-breaker alone gets none right.
      const drivers = await trx
        .insert(driver)
        .values([
          { firstName: 'Jan Paweł', lastName: 'Adamski' },
          { firstName: 'Jana', lastName: 'Abacka' },
          { firstName: 'Jan', lastName: 'Zieliński' },
          { firstName: 'Jan', lastName: 'Adamczyk' },
        ])
        .returning();
      const orderRow = orderRowFor(refs);
      const [janPawel, jana, janZ, janA] = (
        await trx
          .insert(order)
          .values(drivers.map((d, i) => orderRow({ orderNr: `ZL/${i}`, driverId: d.id })))
          .returning({ id: order.id })
      ).map((o) => o.id);
      const byName = [janA, janZ, janPawel, jana];

      expect(await sortedIds(trx, 'driverFullname', false)).toEqual(byName);
      expect(await sortedIds(trx, 'driverFullname', true)).toEqual(byName.toReversed());
    }));
});

const searchedIds = (trx: dbTransaction, search: string) => foundIds(trx, { search });

describe('findOrders search', () => {
  it('finds Orders by Customer, Driver or Truck, ignoring case', () =>
    withRollback(async (trx) => {
      const { first, second } = await seed(trx);

      expect(await searchedIds(trx, 'alfa trans')).toEqual([second]);
      expect(await searchedIds(trx, 'KOWALSKI')).toEqual([first]);
      expect(await searchedIds(trx, 'jan kowalski')).toEqual([first]);
      expect(await searchedIds(trx, 'ab12')).toEqual([second]);
    }));

  it.each([
    ['a space', 'ab 12'],
    ['a dash', 'AB-1234'],
    ['a no-break space', 'ab\u00a012'],
  ])('finds an Order by its Plate typed with %s', (_, search) =>
    withRollback(async (trx) => {
      const { second } = await seed(trx);

      expect(await searchedIds(trx, search)).toEqual([second]);
    }));

  it('finds no Order by its Plate when the term is only dashes and spaces', () =>
    withRollback(async (trx) => {
      await seed(trx);

      expect(await searchedIds(trx, '- -')).toEqual([]);
    }));

  it('finds an Order by its Order Number with the term as typed, dashes included', () =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      const withDash = await seedOrder(trx, refs, { orderNr: 'TEST-002' });
      await seedOrder(trx, refs, { orderNr: 'TEST002' });

      expect(await searchedIds(trx, 'test-002')).toEqual([withDash.id]);
      expect(await searchedIds(trx, '-')).toEqual([withDash.id]);
    }));

  it.each([
    '_',
    '%',
    '\\',
  ])('finds only Orders containing %s, matching it as itself, alone or within a longer term in any case', (character) =>
    withRollback(async (trx) => {
      const refs = await seedOrderReferences(trx);
      const containing = await seedOrder(trx, refs, { orderNr: `A${character}1` });
      await seedOrder(trx, refs, { orderNr: 'AB1' });

      expect(await searchedIds(trx, character)).toEqual([containing.id]);
      expect(await searchedIds(trx, `a${character}1`)).toEqual([containing.id]);
    }));

  it.each(['_', '%', '\\'])('finds no Order by %s when none contains it', (character) =>
    withRollback(async (trx) => {
      await seed(trx);

      expect(await searchedIds(trx, character)).toEqual([]);
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
  it('returns the requested page, or the last when it is past it, and the count of all matching Orders', () =>
    withRollback(async (trx) => {
      const { first, second, refs } = await seed(trx);
      const [third] = await trx
        .insert(order)
        .values(orderRowFor(refs)({ orderNr: 'ZL/3' }))
        .returning({ id: order.id });

      const page = (pageIndex: number, search?: string) =>
        findOrders(trx, { pageIndex, pageSize: 2, search });

      expect(await page(0)).toMatchObject({ count: 3, data: [{ id: first }, { id: second }] });
      expect(await page(1)).toMatchObject({ count: 3, data: [{ id: third.id }] });
      expect(await page(2)).toMatchObject({ count: 3, data: [{ id: third.id }] });
      expect(await page(0, 'kowalski')).toMatchObject({
        count: 2,
        data: [{ id: first }, { id: third.id }],
      });
      expect(await page(1, 'kowalski')).toMatchObject({
        count: 2,
        data: [{ id: first }, { id: third.id }],
      });
    }));

  it('returns no Orders and a count of 0 when none match', () =>
    withRollback(async (trx) => {
      await seed(trx);

      expect(await findOrders(trx, { pageIndex: 3, pageSize: 2, search: 'nikt' })).toEqual({
        count: 0,
        data: [],
      });
    }));
});
