import { db } from "@/db/db";
import { truck } from "../schemas";
import trucks from "./data/trucks.json";

export default async function seed(db: db) {
	await db.insert(truck).values(trucks);
}
