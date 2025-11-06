import { db } from '@/db/db';
import { driver } from '../schemas';
import drivers from './data/drivers.json';
1;
export default async function seed(db: db) {
  await db.insert(driver).values(drivers);
}
