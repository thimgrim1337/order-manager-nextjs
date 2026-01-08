'use server';

import db, { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { eq } from 'drizzle-orm';

export async function getAllTrucks() {
  return await db.query.truck.findMany();
}

export async function getTruck(truckId: number) {
  return await db.query.truck.findFirst({
    where: (truck) => eq(truck.id, truckId),
  });
}

export async function updateTruckAssignedDriver(
  truckId: number,
  driverId: number,
  trx: dbTransaction
) {
  const result = await getTruck(truckId);

  if (result?.driverId === driverId) return;

  await trx
    .update(truck)
    .set({ driverId: driverId })
    .where(eq(truck.id, truckId));
}
