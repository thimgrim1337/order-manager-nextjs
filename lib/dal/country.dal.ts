import { cacheLife, cacheTag } from "next/cache";
import db from "@/db/db";

export async function getAllCountries() {
	"use cache";
	cacheLife("weeks");
	cacheTag("countries");

	return await db.query.country.findMany();
}
