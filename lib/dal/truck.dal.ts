import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import { CACHE_TAG } from '@/lib/consts';

export async function getAllTrucks() {
  'use cache';
  cacheLife('days');

  cacheTag(CACHE_TAG.Trucks);

  const dbTrucks = await db.query.truck.findMany();
  return dbTrucks;
}
