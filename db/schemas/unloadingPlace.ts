import {
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
} from 'drizzle-orm/pg-core';
import order from './order';
import city from './city';
import { relations } from 'drizzle-orm';

const unloadingPlace = pgTable(
  'order_unloading_places',
  {
    orderId: integer('order_id')
      .notNull()
      .references(() => order.id),
    placeId: integer('place_id')
      .notNull()
      .references(() => city.id),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.placeId] }),
    index('idx_unloading_places_order_id').on(table.orderId),
  ]
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
