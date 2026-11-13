import { relations, sql } from 'drizzle-orm';
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { order } from '.';

const driver = pgTable(
  'drivers',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
  },
  (table) => [
    uniqueIndex('drivers_name_unique').using(
      'btree',
      sql`LOWER(${table.firstName})`,
      sql`LOWER(${table.lastName})`,
    ),
  ],
);

export const driversRelations = relations(driver, ({ many }) => ({
  orders: many(order),
}));

export default driver;
