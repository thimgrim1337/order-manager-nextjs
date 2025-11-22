import db from '@/db/db';
import { country } from '@/db/schemas';

export default async function getAllCountries() {
  return await db.select().from(country);
}
