import { ilike, or } from 'drizzle-orm';
import db from '@/db/db';
import { customer } from '@/db/schemas';

export async function getAllCustomers(filters?: string) {
  const searchTerm = filters ? `%${filters.trim().toLocaleLowerCase()}%` : undefined;

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
