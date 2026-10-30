import { ilike } from 'drizzle-orm';
import db from '@/db/db';
import { city } from '@/db/schemas';

export async function getAllCities(filters?: string) {
  const searchTerm = filters ? `%${filters.trim().toLocaleLowerCase()}%` : undefined;

  return db
    .select()
    .from(city)
    .where(searchTerm ? ilike(city.name, searchTerm) : undefined)
    .orderBy(city.name)
    .limit(10);
}
