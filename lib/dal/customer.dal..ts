import db from '@/db/db';
import { customer } from '@/db/schemas';
import { and, eq, ilike, or } from 'drizzle-orm';
import { CreateCustomerDto } from '../dto/customer.dto';

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

  const dbCustomers = await query.orderBy(customer.name).limit(10);

  return dbCustomers;
}

export async function checkIfCustomerExist(dto: CreateCustomerDto) {
  const dbCustomer = await db.query.customer.findFirst({
    where: (customer) =>
      and(eq(customer.name, dto.name), eq(customer.tax, dto.tax)),
  });

  return dbCustomer ? true : false;
}

export async function createCustomer(dto: CreateCustomerDto) {
  const [newCustomer] = await db.insert(customer).values(dto).returning();
  return newCustomer;
}
