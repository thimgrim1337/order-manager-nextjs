import { db } from "@/db/db";
import { status } from "../schemas";
import statuses from "./data/status.json";

export default async function seed(db: db) {
	await db.insert(status).values(statuses);
}
