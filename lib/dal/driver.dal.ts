import db from '@/db/db';

export async function getAllDrivers() {
  return await db.query.driver.findMany();
}
