'use server';

import db from '@/db/db';

export default async function getAllCountries() {
  return await db.query.country.findMany();
}
