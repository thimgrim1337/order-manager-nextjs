import { ilike, or } from 'drizzle-orm';
import { cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { customer } from '@/db/schemas';
import { CACHE_TAG, SEARCH_LIMIT } from '@/lib/consts';
import { toSearchTerm } from '../utils';

/** Customers whose name or tax number contains `search`, ignoring case, by name. */
export async function findCustomers(database: db | dbTransaction, search?: string) {
  const searchTerm = toSearchTerm(search);

  return database
    .select()
    .from(customer)
    .where(
      searchTerm
        ? or(ilike(customer.name, searchTerm), ilike(customer.tax, searchTerm))
        : undefined,
    )
    .orderBy(customer.name)
    .limit(SEARCH_LIMIT);
}

export async function getCustomers(search?: string) {
  'use cache';
  cacheTag(CACHE_TAG.Customers);

  return findCustomers(db, search);
}
