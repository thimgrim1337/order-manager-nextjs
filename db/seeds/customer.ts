import { db } from "@/db/db";
import { customer } from "../schemas";
import customers from "./data/customers.json";

export default async function seed(db: db) {
	await db.insert(customer).values(customers);
}
