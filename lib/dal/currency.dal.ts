import db from "@/db/db";
import { currency } from "@/db/schemas";

export async function getAllCurrencies() {
	return db.select().from(currency);
}
