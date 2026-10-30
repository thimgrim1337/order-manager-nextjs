import { type InferSelectModel, ilike } from 'drizzle-orm';
import db from '@/db/db';
import { city } from '@/db/schemas';

export type DbCity = InferSelectModel<typeof city>;

export async function getAllCities(filters?: string) {
  const searchTerm = filters ? `%${filters.trim().toLocaleLowerCase()}%` : undefined;

  return db
    .select()
    .from(city)
    .where(searchTerm ? ilike(city.name, searchTerm) : undefined)
    .orderBy(city.name)
    .limit(10);
}

export async function getCityByName(cityName: string) {
  const dbCity = await db.query.city.findFirst({
    where: ilike(city.name, cityName),
  });

  return dbCity ? dbCity : null;
}
