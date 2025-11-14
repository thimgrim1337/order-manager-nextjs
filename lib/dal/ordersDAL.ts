import db from '@/db/db';
import { ordersWithDetailsView } from '@/db/schemas';
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { Order, OrderFilters, SortOptions } from '@/types/types';
import { analyzeGlobalFiltering } from '../utils';

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 10;

export async function getAllOrders(
  pageIndex: number = DEFAULT_PAGE_INDEX,
  pageSize: number = DEFAULT_PAGE_SIZE,
  sortOptions?: SortOptions,
  filters?: OrderFilters
): Promise<Order[]> {
  const sortField = sortOptions?.field;
  const sortOrder = sortOptions?.order === 'desc' ? desc : asc;

  console.log(sortField);

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

  if (filters?.startDate) {
    whereConditions.push(
      gte(ordersWithDetailsView.startDate, filters.startDate)
    );
  }

  if (filters?.endDate) {
    whereConditions.push(lte(ordersWithDetailsView.endDate, filters.endDate));
  }

  if (filters?.globalFilters) {
    const { searchTerm, isNumeric, numericValue, isDate, normalizedDate } =
      analyzeGlobalFiltering(filters.globalFilters);

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
