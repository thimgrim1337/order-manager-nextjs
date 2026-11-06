import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { country } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

/** Every Country. */
async function findCountries(database: db | dbTransaction) {
  return database.select({ id: country.id, name: country.name, code: country.code }).from(country);
}

export type CountryReadModel = Awaited<ReturnType<typeof findCountries>>[number];

export async function getAllCountries() {
  'use cache';
  cacheLife('weeks');
  cacheTag(CACHE_TAG.Countries);

  return findCountries(db);
}
