import { cacheLife, cacheTag } from 'next/cache';
import db, { type dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { CACHE_TAG } from '@/lib/consts';

/** Every Truck. */
async function findTrucks(database: db | dbTransaction) {
  return database
    .select({
      id: truck.id,
      plate: truck.plate,
      insuranceEndAt: truck.insuranceEndAt,
      serviceEndAt: truck.serviceEndAt,
      driverId: truck.driverId,
    })
    .from(truck);
}

export type TruckReadModel = Awaited<ReturnType<typeof findTrucks>>[number];

export async function getAllTrucks() {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAG.Trucks);

  return findTrucks(db);
}
