'use server';

import db from '@/db/db';
import { customer } from '@/db/schemas';
import { and, ilike, or } from 'drizzle-orm';

export async function getAllCustomers(filters?: string) {
  const searchTerm = `%${filters?.trim().toLowerCase()}%`;
  const whereConditions: any[] = [];

  let query = db.select().from(customer);

  if (filters) {
    const searchConditions = [
      ilike(customer.name, searchTerm.toLowerCase()),
      ilike(customer.tax, searchTerm.toLowerCase()),
    ];

    whereConditions.push(or(...searchConditions));
  }

  if (whereConditions.length > 0) query.where(and(...whereConditions));

  const data = await query.orderBy(customer.name).limit(10);

  return data;
}
