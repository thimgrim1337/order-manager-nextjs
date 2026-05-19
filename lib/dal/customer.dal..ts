import { ilike, or } from "drizzle-orm";
import db from "@/db/db";
import { customer } from "@/db/schemas";
import { CreateCustomerDto } from "../dto/customer.dto";

export async function getAllCustomers(filters?: string) {
	const searchTerm = filters
		? `%${filters.trim().toLocaleLowerCase()}%`
		: undefined;

	return db
		.select()
		.from(customer)
		.where(
			searchTerm
				? or(ilike(customer.name, searchTerm), ilike(customer.tax, searchTerm))
				: undefined,
		)
		.orderBy(customer.name)
		.limit(10);
}

export async function createCustomer(dto: CreateCustomerDto) {
	const [newCustomer] = await db.insert(customer).values(dto).returning();
	return newCustomer;
}
