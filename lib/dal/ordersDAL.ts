'use server';

import db, { dbTransaction } from '@/db/db';
import {
  loadingPlace,
  order,
  ordersWithDetailsView,
  unloadingPlace,
} from '@/db/schemas';
import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { OrderCreate, SortOptions } from '@/types/types';
import { analyzeGlobalFiltering } from '../utils';

export async function getAllOrders(
  pageIndex: number,
  pageSize: number,
  sortOptions?: SortOptions,
  filters?: string
) {
  const sortField = sortOptions?.id;
  const sortOrder = sortOptions?.desc === true ? desc : asc;

  const getSortColumn = (field?: string) => {
    const sortMappings = {
      statusId: ordersWithDetailsView.statusId,
      truckId: ordersWithDetailsView.truckId,
      loadingCity: ordersWithDetailsView.loadingCity,
      unloadingCity: ordersWithDetailsView.unloadingCity,
      orderNr: ordersWithDetailsView.orderNr,
      startDate: ordersWithDetailsView.startDate,
      endDate: ordersWithDetailsView.endDate,
      pricePLN: ordersWithDetailsView.pricePLN,
      priceCurrency: ordersWithDetailsView.priceCurrency,
      currency: ordersWithDetailsView.currency,
    };

    return (
      sortMappings[field as keyof typeof sortMappings] ||
      ordersWithDetailsView.id
    );
  };

  let query = db.select().from(ordersWithDetailsView);

  const whereConditions: any[] = [];

  if (filters) {
    const { searchTerm, isNumeric, numericValue, isDate, normalizedDate } =
      analyzeGlobalFiltering(filters);

    const searchConditions = [
      ilike(ordersWithDetailsView.orderNr, searchTerm),
      ilike(ordersWithDetailsView.customer, searchTerm),
      ilike(ordersWithDetailsView.driver, searchTerm),
      ilike(ordersWithDetailsView.truck, searchTerm),
      ilike(ordersWithDetailsView.status, searchTerm),
      ilike(ordersWithDetailsView.currency, searchTerm),
      ilike(ordersWithDetailsView.loadingCity, searchTerm),
      ilike(ordersWithDetailsView.unloadingCity, searchTerm),
    ];

    if (isNumeric) {
      searchConditions.push(
        sql`${ordersWithDetailsView.pricePLN}::numeric BETWEEN ${
          numericValue - 1
        } AND ${numericValue + 1}`,
        sql`${ordersWithDetailsView.priceCurrency}::numeric BETWEEN ${
          numericValue - 1
        } AND ${numericValue + 1}`
      );
    }

    if (isDate) {
      searchConditions.push(
        eq(sql`DATE(${ordersWithDetailsView.startDate})`, normalizedDate),
        eq(sql`DATE(${ordersWithDetailsView.endDate})`, normalizedDate)
      );
    }

    whereConditions.push(or(...searchConditions));
  }

  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  return query
    .orderBy(sortOrder(getSortColumn(sortField)))
    .limit(pageSize)
    .offset(pageIndex * pageSize);
}

export async function getOrderCount() {
  return db.select({ count: count() }).from(order);
}

export async function getOrderByNumberAndCustomer(
  orderNumber: string,
  customerId: number
) {
  return db.query.order.findFirst({
    where: (order) =>
      and(eq(order.orderNr, orderNumber), eq(order.customerId, customerId)),
  });
}

export async function createOrder(newOrder: OrderCreate, trx: dbTransaction) {
  const query = await trx.insert(order).values(newOrder).returning();
  return query[0];
}

export async function addOrderPlaces(
  orderId: number,
  placesIds: number[],
  placeType: 'loadingPlace' | 'unloadingPlace',
  trx: dbTransaction
) {
  const places = placesIds.map((placeId) => ({
    orderId,
    placeId,
  }));
  const table = placeType === 'loadingPlace' ? loadingPlace : unloadingPlace;
  return trx.insert(table).values(places);
}
