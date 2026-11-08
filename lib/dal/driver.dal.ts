import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { driver } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';
import { inPolishOrder } from '@/lib/polish-order';

/** Every Driver, by first then last name in Polish alphabetical order. */
export async function findDrivers(database: db | dbTransaction) {
  return database
    .select({ id: driver.id, firstName: driver.firstName, lastName: driver.lastName })
    .from(driver)
    .orderBy(inPolishOrder(driver.firstName), inPolishOrder(driver.lastName));
}

export type DriverReadModel = Awaited<ReturnType<typeof findDrivers>>[number];

export async function getAllDrivers() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Drivers);

  return findDrivers(db);
}
