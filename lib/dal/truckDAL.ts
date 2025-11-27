'use server';

import db from '@/db/db';
import { truck } from '@/db/schemas';

export default async function getAllTrucks() {
  return await db.select().from(truck);
}
