import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import { CACHE_TAG } from '@/lib/consts';

export async function getAllCountries() {
  'use cache';
  cacheLife('weeks');
  cacheTag(CACHE_TAG.Countries);

  return await db.query.country.findMany();
}
