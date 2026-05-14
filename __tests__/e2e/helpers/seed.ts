import { getTableName, sql } from "drizzle-orm";
import db from "@/db/db";
import {
	city as cities,
	country as countries,
	currency as currencies,
	customer as customers,
	driver as drivers,
	status as statuses,
	truck as trucks,
} from "@/db/schemas";

export async function seedTestData() {
	const [country] = await db
		.insert(countries)
		.values({
			name: "Poland",
			code: "PL",
		})
		.returning();

	const [customer] = await db
		.insert(customers)
		.values({
			name: "Test Firma",
			tax: "PL1234567890",
		})
		.returning();

	const [driver] = await db
		.insert(drivers)
		.values({
			firstName: "Jan",
			lastName: "Kowalski",
		})
		.returning();

	const [truck] = await db
		.insert(trucks)
		.values({
			plate: "WP0997C",
			driverId: driver.id,
			insuranceEndAt: "2027-01-01",
			serviceEndAt: "2027-01-01",
		})
		.returning();

	const dbCities = await db
		.insert(cities)
		.values([
			{
				name: "Warszawa",
				postal: "00-001",
				countryId: country.id,
			},
			{
				name: "Płock",
				postal: "09-400",
				countryId: country.id,
			},
		])
		.returning();

	const [status] = await db
		.insert(statuses)
		.values([
			{
				name: "w trakcie",
			},
			{ name: "anulowane" },
			{
				name: "zakończone",
			},
		])
		.returning();

	const currency = await db
		.insert(currencies)
		.values([{ code: "PLN" }, { code: "EUR" }]);

	return { customer, driver, truck, dbCities, status, currency };
}

export async function cleanupTestData() {
	for (const table of [
		cities,
		trucks,
		drivers,
		customers,
		countries,
		statuses,
		currencies,
	]) {
		await db.execute(
			sql.raw(`TRUNCATE TABLE ${getTableName(table)} RESTART IDENTITY CASCADE`),
		);
	}
}
