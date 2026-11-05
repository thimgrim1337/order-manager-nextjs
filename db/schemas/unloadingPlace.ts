import { relations } from 'drizzle-orm';
import { index, integer, pgTable, primaryKey, unique } from 'drizzle-orm/pg-core';
import city from './city';
import order from './order';

const unloadingPlace = pgTable(
  'order_unloading_places',
  {
    orderId: integer('order_id')
      .notNull()
      .references(() => order.id),
    placeId: integer('place_id')
      .notNull()
      .references(() => city.id),
    /** Where the Place stands among the Order's, in the order the user entered them, from 0. */
    position: integer('position').notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.placeId] }),
    unique().on(table.orderId, table.position),
    index('idx_unloading_places_order_id').on(table.orderId),
  ],
);

export const unloadingPlaceRelations = relations(unloadingPlace, ({ one }) => ({
  order: one(order, {
    fields: [unloadingPlace.orderId],
    references: [order.id],
  }),
  place: one(city, {
    fields: [unloadingPlace.placeId],
    references: [city.id],
  }),
}));

export default unloadingPlace;
