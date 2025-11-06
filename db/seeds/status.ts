import { db } from '@/db/db';
import statuses from './data/status.json';
import { status } from '../schemas';

export default async function seed(db: db) {
  await db.insert(status).values(statuses);
}
