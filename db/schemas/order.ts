import { relations, sql } from 'drizzle-orm';
import {
  date,
  index,
  integer,
  numeric,
  pgTable,
  pgView,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import { currency, customer, driver, loadingPlace, status, truck, unloadingPlace } from '.';

const order = pgTable(
  'orders',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull().defaultNow(),
    orderNr: text('order_nr').notNull(),
    startDate: date('start_date', { mode: 'string' }).notNull().defaultNow(),
    endDate: date('end_date', { mode: 'string' }).notNull().defaultNow(),
    statusId: integer('status_id')
      .notNull()
      .references(() => status.id)
      .default(1),
    priceCurrency: numeric('price_currency', {
      precision: 10,
      scale: 2,
    }).notNull(),
    pricePLN: numeric('price_pln', {
      precision: 10,
      scale: 2,
    }).notNull(),
    currencyId: integer('currency_id')
      .notNull()
      .references(() => currency.id),
    exchangeRate: numeric('exchange_rate', {
      precision: 5,
      scale: 4,
    })
      .notNull()
      .default('1'),
    exchangeDate: date('exchange_date', { mode: 'string' }),
    truckId: integer('truck_id')
      .notNull()
      .references(() => truck.id),
    driverId: integer('driver_id')
      .notNull()
      .references(() => driver.id),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customer.id),
  },
  (table) => [
    unique().on(table.customerId, table.orderNr),
    index('idx_orders_order_nr_lower').using('btree', sql`LOWER(${table.orderNr})`),
    index('idex_orders_start_date_date').using('btree', sql`DATE(${table.startDate})`),
    index('idex_orders_end_date_date').using('btree', sql`DATE(${table.endDate})`),
  ],
);

/**
 * Defined in SQL by the latest migration that recreates it
 * (`grep -l 'CREATE VIEW orders_with_details' db/migrations`); these columns are kept in step by hand.
 * See `docs/agents/migrations.md`.
 */
export const ordersWithDetailsView = pgView('orders_with_details', {
  id: integer().notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }),
  updatedAt: timestamp('updated_at', { mode: 'string' }),
  orderNr: text('order_nr').notNull(),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }).notNull(),
  statusId: integer('status_id'),

  priceCurrency: numeric('price_currency', {
    precision: 10,
    scale: 2,
  }).notNull(),
  pricePLN: numeric('price_pln', { precision: 10, scale: 2 }).notNull(),
  currencyId: integer('currency_id'),
  exchangeRate: numeric('exchange_rate', {
    precision: 5,
    scale: 4,
  }),
  exchangeDate: date('exchange_date', { mode: 'string' }),
  truckId: integer('truck_id'),
  driverId: integer('driver_id'),
  customerId: integer('customer_id'),

  // Sorting and Search helpers
  loadingCity: text('loading_city'),
  unloadingCity: text('unloading_city'),
  customerName: text('customer_name'),
  driverFirstName: text('driver_first_name'),
  driverLastName: text('driver_last_name'),
  truckPlate: text('truck_plate'),
  statusName: text('status_name'),
  currencyCode: text('currency_code'),
}).existing();

export const orderRelations = relations(order, ({ one, many }) => ({
  status: one(status, {
    fields: [order.statusId],
    references: [status.id],
  }),
  truck: one(truck, {
    fields: [order.truckId],
    references: [truck.id],
  }),
  driver: one(driver, {
    fields: [order.driverId],
    references: [driver.id],
  }),
  customer: one(customer, {
    fields: [order.customerId],
    references: [customer.id],
  }),
  currency: one(currency, {
    fields: [order.currencyId],
    references: [currency.id],
  }),
  loadingPlaces: many(loadingPlace),
  unloadingPlaces: many(unloadingPlace),
}));

export default order;
