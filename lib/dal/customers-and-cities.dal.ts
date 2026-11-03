import { ilike, or } from 'drizzle-orm';
import { cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { city, customer } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

/** How many Customers or Cities a search returns: the comboboxes show the first ones by name. */
const SEARCH_LIMIT = 10;

/** `%search%`, or undefined for an empty search, which matches everything. */
function toSearchTerm(search?: string) {
  const trimmed = search?.trim();

  return trimmed ? `%${trimmed}%` : undefined;
}

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

/** Cities whose name contains `search`, ignoring case, by name. */
export async function findCities(database: db | dbTransaction, search?: string) {
  const searchTerm = toSearchTerm(search);

  return database
    .select()
    .from(city)
    .where(searchTerm ? ilike(city.name, searchTerm) : undefined)
    .orderBy(city.name)
    .limit(SEARCH_LIMIT);
}

export async function getCities(search?: string) {
  'use cache';
  cacheTag(CACHE_TAG.Cities);

  return findCities(db, search);
}
