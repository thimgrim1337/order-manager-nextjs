'use server';

import db from '@/db/db';
import { city } from '@/db/schemas';
import { City } from '@/types/types';
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

export async function getCityByName(cityName: string) {
  return db.query.city.findFirst({ where: ilike(city.name, cityName) });
}

export async function createCity(newCity: City) {
  const query = await db.insert(city).values(newCity).returning();
  return query[0];
}

export async function getCitiesIds(cities: City[]) {
  if (!cities || !Array.isArray(cities))
    throw new Error('Invalid cities array provided.');

  if (cities.length === 0) return [];

  try {
    const results = await Promise.all(
      cities.map(async (city) => {
        if (city.id && typeof city.id === 'number') return city.id;

        const existingCity = await getCityByName(city.name);

        if (existingCity?.id) return existingCity.id;

        const newCity = await createCity({
          ...city,
          name: city.name,
        });

        if (!newCity?.id)
          throw new Error(`Failed to create city: ${city.name}`);

        return newCity.id;
      })
    );
    return results;
  } catch (error) {
    throw new Error(`Failed to process cities: ${error}`);
  }
}
