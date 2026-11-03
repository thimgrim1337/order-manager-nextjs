import { ilike } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { city } from '@/db/schemas';
import { CACHE_TAG, SEARCH_LIMIT } from '@/lib/consts';
import { toSearchTerm } from '../utils';

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
  cacheLife('days');
  cacheTag(CACHE_TAG.Cities);

  return findCities(db, search);
}
