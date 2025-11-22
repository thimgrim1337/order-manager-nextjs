import db from '@/db/db';
import { city } from '@/db/schemas';
import { and, ilike } from 'drizzle-orm';

export async function getAllCities(filters?: string) {
  const searchTerm = `%${filters?.trim().toLowerCase()}%`;
  const whereConditions: any[] = [];

  let query = db.select().from(city);

  if (filters) {
    const searchCondition = ilike(city.name, searchTerm.toLowerCase());

    whereConditions.push(searchCondition);
  }

  if (whereConditions.length > 0) query.where(and(...whereConditions));

  const data = await query.orderBy(city.name).limit(10);

  return data;
}
