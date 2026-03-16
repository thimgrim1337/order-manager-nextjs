import { db } from "@/db/db";
import { country } from "../schemas";
import countries from "./data/countries.json";

export default async function seed(db: db) {
	await db.insert(country).values(countries);
}
