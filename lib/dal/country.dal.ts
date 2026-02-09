import db from '@/db/db';

export async function getAllCountries() {
  return await db.query.country.findMany();
}
