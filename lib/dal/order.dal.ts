import { isValid } from 'date-fns';
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { order, ordersWithDetailsView } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';
import { parseDate } from '@/lib/dates';
import { type Week, weekBounds } from '@/lib/week';
import { toSearchTerm } from '../utils';

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

/** The columns of an Order as the Orders Table and the Timeline show it. */
const orderReadModel = {
  id: ordersWithDetailsView.id,
  orderNr: ordersWithDetailsView.orderNr,
  startDate: ordersWithDetailsView.startDate,
  endDate: ordersWithDetailsView.endDate,
  status: ordersWithDetailsView.status,
  customer: ordersWithDetailsView.customer,
  driver: ordersWithDetailsView.driver,
  truck: ordersWithDetailsView.truck,
  currency: ordersWithDetailsView.currency,
  priceCurrency: ordersWithDetailsView.priceCurrency,
  pricePLN: ordersWithDetailsView.pricePLN,
  loadingPlaces: ordersWithDetailsView.loadingPlaces,
  unloadingPlaces: ordersWithDetailsView.unloadingPlaces,
};

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
    price: Number.isNaN(price) ? undefined : price,
    // A date-shaped term that is no calendar date (`31-02-2026`) is text only.
    date: dateShaped && isValid(parseDate(dateShaped)) ? dateShaped : undefined,
  };
}

/** An Order as the Orders Table and the Timeline receive it. */
export type OrderReadModel = Awaited<ReturnType<typeof findOrdersInWeek>>[number];

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
    const { pattern, price, date } = search;

    searchConditions.push(
      ilike(ordersWithDetailsView.orderNr, pattern),
      ilike(ordersWithDetailsView.customerName, pattern),
      // The Driver's name as `driverName` shows it: "Jan Kowalski".
      ilike(
        sql`${ordersWithDetailsView.driverFirstName} || ' ' || ${ordersWithDetailsView.driverLastName}`,
        pattern,
      ),
      ilike(ordersWithDetailsView.truckPlate, pattern),
      ilike(ordersWithDetailsView.statusName, pattern),
      ilike(ordersWithDetailsView.currencyCode, pattern),
      ilike(ordersWithDetailsView.loadingCity, pattern),
      ilike(ordersWithDetailsView.unloadingCity, pattern),
    );

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

  const orders = database
    .select(orderReadModel)
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .orderBy(...orderBy)
    .limit(query.pageSize)
    .offset(query.pageIndex * query.pageSize);

  const ordersCount = database
    .select({ count: count() })
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .then(([row]) => row?.count ?? 0);

  return {
    data: await orders,
    count: await ordersCount,
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

  return database
    .select(orderReadModel)
    .from(ordersWithDetailsView)
    .where(
      and(
        lte(ordersWithDetailsView.startDate, sunday),
        gte(ordersWithDetailsView.endDate, monday),
        opts?.driverId ? eq(ordersWithDetailsView.driverId, opts.driverId) : undefined,
      ),
    )
    .orderBy(asc(ordersWithDetailsView.startDate), asc(ordersWithDetailsView.id));
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
  if (!found) return undefined;

  const { endDate, currencyId, exchangeRate, exchangeDate } = found;

  return {
    endDate,
    currencyId,
    // Shaped as the Order read model carries it.
    currency: { id: currencyId, rate: Number(exchangeRate), date: exchangeDate },
  };
}
