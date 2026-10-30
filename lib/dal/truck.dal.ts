import { eq } from 'drizzle-orm';
import { cacheLife, cacheTag } from 'next/cache';
import db from '@/db/db';

export async function getAllTrucks() {
  'use cache';
  cacheLife('days');

  cacheTag('trucks');

  const dbTrucks = await db.query.truck.findMany();
  return dbTrucks;
}

export async function getTruck(truckId: number) {
  const dbTruck = await db.query.truck.findFirst({
    where: (truck) => eq(truck.id, truckId),
  });
  return dbTruck;
}
