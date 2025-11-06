import { relations, sql } from 'drizzle-orm';
import {
  integer,
  pgTable,
  text,
  date,
  index,
  AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { driver, order } from '.';

const trucks = pgTable(
  'trucks',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    plate: text().unique().notNull(),
    insuranceEndAt: date('insurance_endAt').notNull(),
    serviceEndAt: date('service_endAt').notNull(),
    driverId: integer('driver_id').references((): AnyPgColumn => driver.id),
  },
  (table) => [
    index('idx_trucks_plate_lower').using('btree', sql`LOWER(${table.plate})`),
  ]
);

export const trucksRelations = relations(trucks, ({ one, many }) => ({
  orders: many(order),
  driver: one(driver, {
    fields: [trucks.id],
    references: [driver.id],
  }),
}));

export default trucks;
