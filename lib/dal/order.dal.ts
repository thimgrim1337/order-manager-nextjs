import { isValid } from 'date-fns';
import { and, asc, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { ordersWithDetailsView } from '@/db/schemas';
import { CACHE_TAG, type OrderSortField } from '@/lib/consts';
import { parseDate } from '@/lib/dates';
import { type Week, weekBounds } from '@/lib/week';
import type { OrderFilters, SortParams } from '@/types/types';

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
function parseSearch(search: string) {
  const trimmed = search.trim();
  const price = Number(trimmed);
  const dayFirst = DAY_FIRST_DATE.exec(trimmed);
  const dateShaped = ISO_DATE.test(trimmed)
    ? trimmed
    : dayFirst
      ? `${dayFirst[4]}-${dayFirst[3]}-${dayFirst[1]}`
      : undefined;

  return {
    pattern: `%${trimmed}%`,
    price: trimmed !== '' && !Number.isNaN(price) ? price : undefined,
    // A date-shaped term that is no calendar date (`31-02-2026`) is text only.
    date: dateShaped && isValid(parseDate(dateShaped)) ? dateShaped : undefined,
  };
}

/** An Order as the Orders Table and the Timeline receive it. */
export type OrderReadModel = Awaited<ReturnType<typeof findOrdersInWeek>>[number];

export async function findOrders(
  database: db | dbTransaction,
  pageIndex: number,
  pageSize: number,
  sortParams?: SortParams[],
  filters?: OrderFilters,
) {
  const getSortColumn = (sortParams?: SortParams[]) => {
    const sortMappings: Record<OrderSortField, AnyPgColumn> = {
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
      driverFullname: ordersWithDetailsView.driverFullname,
    };

    const columns = (sortParams ?? []).map((param) => {
      const col = sortMappings[param.id];
      return param.desc ? desc(col) : asc(col);
    });

    // Tie-breaker keeps row order stable across pages.
    return [...columns, asc(ordersWithDetailsView.id)];
  };

  const sortColumn = getSortColumn(sortParams);

  const searchConditions = [];
  const allWhereConditions = [];

  if (filters?.search) {
    const { pattern, price, date } = parseSearch(filters.search);

    searchConditions.push(
      ilike(ordersWithDetailsView.orderNr, pattern),
      ilike(ordersWithDetailsView.customerName, pattern),
      ilike(ordersWithDetailsView.driverFullname, pattern),
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

  if (filters?.startDate) {
    allWhereConditions.push(gte(ordersWithDetailsView.startDate, filters.startDate));
  }

  if (filters?.endDate) {
    allWhereConditions.push(lte(ordersWithDetailsView.endDate, filters.endDate));
  }

  if (filters?.driverId) {
    allWhereConditions.push(eq(ordersWithDetailsView.driverId, filters.driverId));
  }

  if (filters?.statusId) {
    allWhereConditions.push(eq(ordersWithDetailsView.statusId, filters.statusId));
  }

  const whereConditions = allWhereConditions.length > 0 ? and(...allWhereConditions) : undefined;

  const orders = database
    .select(orderReadModel)
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .orderBy(...sortColumn)
    .limit(pageSize)
    .offset(pageIndex * pageSize);

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

export async function getAllOrders(
  pageIndex: number,
  pageSize: number,
  sortParams?: SortParams[],
  filters?: OrderFilters,
) {
  'use cache';
  // Hours, not days: Order writes invalidate the tag, but one outside the app would not.
  cacheLife('hours');
  cacheTag(CACHE_TAG.Orders);

  return findOrders(db, pageIndex, pageSize, sortParams, filters);
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
