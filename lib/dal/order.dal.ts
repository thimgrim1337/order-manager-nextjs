import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  type InferSelectModel,
  type InferSelectViewModel,
  ilike,
  lte,
  or,
  sql,
} from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { type order, ordersWithDetailsView } from '@/db/schemas';
import { CACHE_TAG, type OrderSortField } from '@/lib/consts';
import { type Week, weekDays } from '@/lib/week';
import type { OrderFilters, SortParams } from '@/types/types';
import { analyzeGlobalFiltering } from '../utils';

export type DbOrderView = InferSelectViewModel<typeof ordersWithDetailsView>;
export type DbOrder = InferSelectModel<typeof order>;

export async function getAllOrders(
  pageIndex: number,
  pageSize: number,
  sortParams?: SortParams[],
  filters?: OrderFilters,
) {
  'use cache';
  cacheTag(CACHE_TAG.Orders);

  const getSortColumn = (sortParams?: SortParams[]) => {
    const sortMappings: Record<OrderSortField, AnyPgColumn> = {
      statusId: ordersWithDetailsView.statusId,
      truckId: ordersWithDetailsView.truckId,
      loadingCity: ordersWithDetailsView.loadingCity,
      unloadingCity: ordersWithDetailsView.unloadingCity,
      orderNr: ordersWithDetailsView.orderNr,
      startDate: ordersWithDetailsView.startDate,
      endDate: ordersWithDetailsView.endDate,
      pricePLN: ordersWithDetailsView.pricePLN,
      priceCurrency: ordersWithDetailsView.priceCurrency,
      currencyId: ordersWithDetailsView.currencyId,
      customerId: ordersWithDetailsView.customerId,
      driverId: ordersWithDetailsView.driverId,
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

  if (filters?.globalFilters) {
    const { searchTerm, isNumeric, numericValue, isDate, normalizedDate } = analyzeGlobalFiltering(
      filters.globalFilters,
    );

    searchConditions.push(
      ilike(ordersWithDetailsView.orderNr, searchTerm),
      ilike(ordersWithDetailsView.customerName, searchTerm),
      ilike(ordersWithDetailsView.driverFullname, searchTerm),
      ilike(ordersWithDetailsView.truckPlate, searchTerm),
      ilike(ordersWithDetailsView.statusName, searchTerm),
      ilike(ordersWithDetailsView.currencyCode, searchTerm),
      ilike(ordersWithDetailsView.loadingCity, searchTerm),
      ilike(ordersWithDetailsView.unloadingCity, searchTerm),
    );

    if (isNumeric) {
      searchConditions.push(
        sql`${ordersWithDetailsView.pricePLN}::numeric BETWEEN ${
          numericValue - 1
        } AND ${numericValue + 1}`,
        sql`${ordersWithDetailsView.priceCurrency}::numeric BETWEEN ${
          numericValue - 1
        } AND ${numericValue + 1}`,
      );
    }

    if (isDate) {
      searchConditions.push(
        eq(sql`DATE(${ordersWithDetailsView.startDate})`, normalizedDate),
        eq(sql`DATE(${ordersWithDetailsView.endDate})`, normalizedDate),
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

  const orders = db
    .select()
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .orderBy(...sortColumn)
    .limit(pageSize)
    .offset(pageIndex * pageSize);

  const ordersCount = db
    .select({ count: count() })
    .from(ordersWithDetailsView)
    .where(whereConditions)
    .then((rows) => rows[0].count);

  return {
    data: await orders,
    count: await ordersCount,
  };
}

/** Orders in a Week: Start Date on or before its Sunday and End Date on or after its Monday. */
export async function findOrdersInWeek(
  database: db | dbTransaction,
  week: Week,
  opts?: { driverId?: number },
) {
  const days = weekDays(week);
  const monday = days[0].date;
  const sunday = days[6].date;

  return database
    .select()
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
  cacheTag(CACHE_TAG.Orders);

  return findOrdersInWeek(db, week, opts);
}
