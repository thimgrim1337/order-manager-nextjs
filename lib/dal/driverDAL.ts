'use server';

import db from '@/db/db';
import { driver } from '@/db/schemas';

export default async function getAllDrivers() {
  return await db.select().from(driver);
}
