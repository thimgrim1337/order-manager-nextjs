import { relations, sql } from 'drizzle-orm';
import { type AnyPgColumn, check, date, integer, pgTable, text } from 'drizzle-orm/pg-core';
import { driver, order } from '.';

const trucks = pgTable(
  'trucks',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    plate: text().unique().notNull(),
    insuranceEndAt: date('insurance_end_at').notNull(),
    serviceEndAt: date('service_end_at').notNull(),
    driverId: integer('driver_id').references((): AnyPgColumn => driver.id),
  },
  // A Plate is written in capitals and digits only, so the plain unique constraint compares
  // Plates that differ only in letter case, spaces or dashes alike.
  (table) => [check('trucks_plate_canonical', sql`${table.plate} ~ '^[A-Z0-9]+$'`)],
);

export const trucksRelations = relations(trucks, ({ one, many }) => ({
  orders: many(order),
  driver: one(driver, {
    fields: [trucks.driverId],
    references: [driver.id],
  }),
}));

export default trucks;
