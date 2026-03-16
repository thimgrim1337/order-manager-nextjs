import { relations } from "drizzle-orm";
import { index, integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import city from "./city";
import order from "./order";

const loadingPlace = pgTable(
	"order_loading_places",
	{
		orderId: integer("order_id")
			.notNull()
			.references(() => order.id),
		placeId: integer("place_id")
			.notNull()
			.references(() => city.id),
	},
	(table) => [
		primaryKey({ columns: [table.orderId, table.placeId] }),
		index("idx_loading_places_order_id").on(table.orderId),
	],
);

export const loadingPlaceRelations = relations(loadingPlace, ({ one }) => ({
	order: one(order, {
		fields: [loadingPlace.orderId],
		references: [order.id],
	}),
	place: one(city, {
		fields: [loadingPlace.placeId],
		references: [city.id],
	}),
}));

export default loadingPlace;
