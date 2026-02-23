import db from '@/db/db';
import { city } from '@/db/schemas';
import { and, eq, ilike, InferSelectModel } from 'drizzle-orm';
import { CreateCityDto } from '../dto/city.dto';

export type DbCity = InferSelectModel<typeof city>;

export async function getAllCities(filters?: string) {
  const searchTerm = `%${filters?.trim().toLowerCase()}%`;
  const whereConditions: any[] = [];

  let query = db.select().from(city);

  if (filters) {
    const searchCondition = ilike(city.name, searchTerm.toLowerCase());

    whereConditions.push(searchCondition);
  }

  if (whereConditions.length > 0) query.where(and(...whereConditions));

  const dbCities = await query.orderBy(city.name).limit(10);

  return dbCities;
}

export async function getCityByName(cityName: string) {
  const dbCity = await db.query.city.findFirst({
    where: ilike(city.name, cityName),
  });

  return dbCity ? dbCity : null;
}

export async function checkIfCityExist(dto: CreateCityDto) {
  const dbCity = await db.query.city.findFirst({
    where: (city) => eq(city.name, dto.name),
  });

  return dbCity ? true : false;
}

export async function createCity(dto: CreateCityDto) {
  const [newCity] = await db.insert(city).values(dto).returning();
  return newCity;
}
