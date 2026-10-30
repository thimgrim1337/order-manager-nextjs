import { asc } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';
import { CACHE_TAG } from '@/lib/consts';

export async function getAllDrivers() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Drivers);

  return await db.query.driver.findMany({
    orderBy: (driver) => asc(driver.firstName),
  });
}
