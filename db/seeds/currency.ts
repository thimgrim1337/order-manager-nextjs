import db from "../db";
import { currency } from "../schemas";
import currencies from "./data/currencies.json";

export default async function seed(db: db) {
	await db.insert(currency).values(currencies);
}
