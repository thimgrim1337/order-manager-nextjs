import { db } from '@/db/db';
import trucks from './data/trucks.json';
import { truck } from '../schemas';

export default async function seed(db: db) {
  await db.insert(truck).values(trucks);
}
