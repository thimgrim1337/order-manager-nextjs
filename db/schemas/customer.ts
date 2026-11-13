import { relations, sql } from 'drizzle-orm';
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import order from './order';

const customer = pgTable(
  'customers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    tax: text('tax').notNull().unique(),
    name: text().notNull(),
  },
  // A name is taken regardless of letter case.
  (table) => [uniqueIndex('customers_name_unique').using('btree', sql`LOWER(${table.name})`)],
);

export const customerRelations = relations(customer, ({ many }) => ({
  orders: many(order),
}));

export default customer;
