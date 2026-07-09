import { asc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import db from "@/db/db";

export async function getAllDrivers() {
	"use cache";
	cacheLife("days");
	cacheTag("drivers");

	return await db.query.driver.findMany({
		orderBy: (driver) => asc(driver.firstName),
	});
}
