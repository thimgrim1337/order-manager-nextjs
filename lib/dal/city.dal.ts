import { eq, InferSelectModel, ilike } from "drizzle-orm";
import db from "@/db/db";
import { city } from "@/db/schemas";
import { CreateCityDto } from "../dto/city.dto";

export type DbCity = InferSelectModel<typeof city>;

export async function getAllCities(filters?: string) {
	const searchTerm = filters
		? `%${filters.trim().toLocaleLowerCase()}%`
		: undefined;

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
