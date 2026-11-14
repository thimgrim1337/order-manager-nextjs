import { isValid } from 'date-fns';
import { and, asc, count, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { loadingPlace, order, ordersWithDetailsView, unloadingPlace } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';
import { parseDate } from '@/lib/dates';
import { existingPageIndex } from '@/lib/pagination';
import { plateSearchText } from '@/lib/plate';
import { toSearchTerm } from '@/lib/search';
import { type Week, weekBounds } from '@/lib/week';

/** The view column(s) each field the Orders Table sorts by orders on. */
const sortColumns = {
  statusId: ordersWithDetailsView.statusId,
  truckPlate: ordersWithDetailsView.truckPlate,
  loadingCity: ordersWithDetailsView.loadingCity,
  unloadingCity: ordersWithDetailsView.unloadingCity,
  orderNr: ordersWithDetailsView.orderNr,
  startDate: ordersWithDetailsView.startDate,
  endDate: ordersWithDetailsView.endDate,
  pricePLN: ordersWithDetailsView.pricePLN,
  priceCurrency: ordersWithDetailsView.priceCurrency,
  currencyId: ordersWithDetailsView.currencyId,
  customerName: ordersWithDetailsView.customerName,
  // As Drivers are ordered: first name, then last name.
  driverFullname: [ordersWithDetailsView.driverFirstName, ordersWithDetailsView.driverLastName],
} satisfies Record<string, AnyPgColumn | AnyPgColumn[]>;

/** A field the Orders Table sorts by. */
export type OrderSortField = keyof typeof sortColumns;

/** The Orders Table's sort: one column, ascending or descending. */
export type SortParams = {
  id: OrderSortField;
  desc: boolean;
};

/** The Orders Table's query, as the Order DAL takes it: its filters, one sort and one page. */
export type OrderQuery = {
  search?: string;
  startDate?: string;
  endDate?: string;
  driverId?: number;
  statusId?: number;
  sort?: SortParams;
  pageIndex: number;
  pageSize: number;
};

/**
 * The Orders with ids `ids`, in that order, as the Orders Table and the Timeline receive them: the
 * Order's own columns, its Customer, Driver, Truck, Status and Currency, and its Loading and
 * Unloading Places.
 */
async function loadOrders(database: db | dbTransaction, ids: number[]) {
  if (ids.length === 0) return [];

  const rows = await database.query.order.findMany({
    where: inArray(order.id, ids),
    with: {
      customer: true,
      driver: true,
      truck: true,
      status: true,
      currency: true,
      // In entered order, each as its City with its Country.
      loadingPlaces: {
        columns: {},
        with: { place: { with: { country: true } } },
        orderBy: [asc(loadingPlace.position)],
      },
      unloadingPlaces: {
        columns: {},
        with: { place: { with: { country: true } } },
        orderBy: [asc(unloadingPlace.position)],
      },
    },
  });

  const byId = new Map(
    rows.map(({ loadingPlaces, unloadingPlaces, ...row }) => [
      row.id,
      {
        ...row,
        loadingPlaces: loadingPlaces.map(({ place }) => place),
        unloadingPlaces: unloadingPlaces.map(({ place }) => place),
      },
    ]),
  );

  return ids.flatMap((id) => byId.get(id) ?? []);
}

/** Day-first dates the search recognises besides ISO, as `day`, `month`, `year` with one separator. */
const DAY_FIRST_DATE = /^(\d{2})([-/.])(\d{2})\2(\d{4})$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** What the Orders Table's Search matches, as `GLOSSARY.md` defines it. */
function parseSearch(search?: string) {
  const term = toSearchTerm(search);
  if (!term) return undefined;

  const { text, pattern } = term;
  const price = Number(text);
  const dayFirst = DAY_FIRST_DATE.exec(text);
  const dateShaped = ISO_DATE.test(text)
    ? text
    : dayFirst
      ? `${dayFirst[4]}-${dayFirst[3]}-${dayFirst[1]}`
      : undefined;

  return {
    pattern,
    platePattern: toSearchTerm(plateSearchText(text))?.pattern,
    price: Number.isNaN(price) ? undefined : price,
    // A date-shaped term that is no calendar date (`31-02-2026`) is text only.
    date: dateShaped && isValid(parseDate(dateShaped)) ? dateShaped : undefined,
  };
}

const idsOf = (rows: { id: number }[]) => rows.map(({ id }) => id);

/** An Order as the Orders Table and the Timeline receive it. */
export type OrderReadModel = Awaited<ReturnType<typeof loadOrders>>[number];

/** The page of Orders matching `query` (the last, if that page is past it) and how many match. */
export async function findOrders(database: db | dbTransaction, query: OrderQuery) {
  const getOrderBy = (sort?: SortParams) => {
    // Tie-breaker keeps row order stable across pages.
    const tieBreaker = asc(ordersWithDetailsView.id);
    if (!sort) return [tieBreaker];

    const columns = [sortColumns[sort.id]].flat();
    return [...columns.map((column) => (sort.desc ? desc(column) : asc(column))), tieBreaker];
  };

  const orderBy = getOrderBy(query.sort);

  const searchConditions = [];
  const allWhereConditions = [];

  const search = parseSearch(query.search);
  if (search) {
    const { pattern, platePattern, price, date } = search;

    searchConditions.push(
      ilike(ordersWithDetailsView.orderNr, pattern),
      ilike(ordersWithDetailsView.customerName, pattern),
      // The Driver's name as `driverName` shows it: "Jan Kowalski".
      ilike(
        sql`${ordersWithDetailsView.driverFirstName} || ' ' || ${ordersWithDetailsView.driverLastName}`,
        pattern,
      ),
      ilike(ordersWithDetailsView.statusName, pattern),
      ilike(ordersWithDetailsView.currencyCode, pattern),
      ilike(ordersWithDetailsView.loadingCity, pattern),
      ilike(ordersWithDetailsView.unloadingCity, pattern),
    );

    if (platePattern) searchConditions.push(ilike(ordersWithDetailsView.truckPlate, platePattern));

    if (price !== undefined) {
      searchConditions.push(
        sql`${ordersWithDetailsView.pricePLN}::numeric BETWEEN ${price - 1} AND ${price + 1}`,
        sql`${ordersWithDetailsView.priceCurrency}::numeric BETWEEN ${price - 1} AND ${price + 1}`,
      );
    }

    if (date) {
      searchConditions.push(
        eq(sql`DATE(${ordersWithDetailsView.startDate})`, date),
        eq(sql`DATE(${ordersWithDetailsView.endDate})`, date),
      );
    }

    allWhereConditions.push(or(...searchConditions));
  }

  if (query.startDate) {
    allWhereConditions.push(gte(ordersWithDetailsView.startDate, query.startDate));
  }

  if (query.endDate) {
    allWhereConditions.push(lte(ordersWithDetailsView.endDate, query.endDate));
  }

  if (query.driverId) {
    allWhereConditions.push(eq(ordersWithDetailsView.driverId, query.driverId));
  }

  if (query.statusId) {
    allWhereConditions.push(eq(ordersWithDetailsView.statusId, query.statusId));
  }

  const whereConditions = allWhereConditions.length > 0 ? and(...allWhereConditions) : undefined;

  const [counted] = await database
    .select({ count: count() })
    .from(ordersWithDetailsView)
    .where(whereConditions);
  const ordersCount = counted?.count ?? 0;
  const pageIndex = existingPageIndex(query.pageIndex, query.pageSize, ordersCount);

  const orderIds = await database
    .select({ id: ordersWithDetailsView.id })
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .orderBy(...orderBy)
    .limit(query.pageSize)
    .offset(pageIndex * query.pageSize);

  return {
    data: await loadOrders(database, idsOf(orderIds)),
    count: ordersCount,
  };
}

export async function getAllOrders(query: OrderQuery) {
  'use cache';
  // Hours, not days: Order writes invalidate the tag, but one outside the app would not.
  cacheLife('hours');
  cacheTag(CACHE_TAG.Orders);

  return findOrders(db, query);
}

/** Orders in a Week: Start Date on or before its Sunday and End Date on or after its Monday. */
export async function findOrdersInWeek(
  database: db | dbTransaction,
  week: Week,
  opts?: { driverId?: number },
) {
  const { monday, sunday } = weekBounds(week);

  const orderIds = await database
    .select({ id: ordersWithDetailsView.id })
    .from(ordersWithDetailsView)
    .where(
      and(
        lte(ordersWithDetailsView.startDate, sunday),
        gte(ordersWithDetailsView.endDate, monday),
        opts?.driverId ? eq(ordersWithDetailsView.driverId, opts.driverId) : undefined,
      ),
    )
    .orderBy(asc(ordersWithDetailsView.startDate), asc(ordersWithDetailsView.id));

  return loadOrders(database, idsOf(orderIds));
}

export async function getOrdersInWeek(week: Week, opts?: { driverId?: number }) {
  'use cache';
  // Hours, not days: Order writes invalidate the tag, but one outside the app would not.
  cacheLife('hours');
  cacheTag(CACHE_TAG.Orders);

  return findOrdersInWeek(db, week, opts);
}

/** The Unloading Date, Currency and stored Exchange Rate of Order `orderId`, if it exists. */
export async function findOrderExchangeRate(database: db | dbTransaction, orderId: number) {
  const [found] = await database
    .select({
      endDate: order.endDate,
      currencyId: order.currencyId,
      exchangeRate: order.exchangeRate,
      exchangeDate: order.exchangeDate,
    })
    .from(order)
    .where(eq(order.id, orderId));

  return found;
}
