'use server';

import db from '@/db/db';

export default async function getAllDrivers() {
  return await db.query.driver.findMany();
}
