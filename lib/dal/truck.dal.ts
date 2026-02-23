import db, { dbTransaction } from '@/db/db';
import { truck } from '@/db/schemas';
import { eq } from 'drizzle-orm';

export async function getAllTrucks() {
  const dbTrucks = await db.query.truck.findMany();
  return dbTrucks;
}

export async function getTruck(truckId: number) {
  const dbTruck = await db.query.truck.findFirst({
    where: (truck) => eq(truck.id, truckId),
  });
  return dbTruck;
}

export async function updateTruckAssignedDriver(
  truckId: number,
  driverId: number,
  trx: dbTransaction,
) {
  const dbTruck = await trx
    .update(truck)
    .set({ driverId })
    .where(eq(truck.id, truckId))
    .returning();

  return dbTruck;
}
