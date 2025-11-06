import { relations } from 'drizzle-orm';
import { integer, pgTable, text } from 'drizzle-orm/pg-core';
import { order } from '.';

const driver = pgTable('drivers', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
});

export const driversRelations = relations(driver, ({ many }) => ({
  orders: many(order),
}));

export default driver;
