import { relations, sql } from "drizzle-orm";
import {
	date,
	index,
	integer,
	json,
	numeric,
	pgTable,
	pgView,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";
import { City, Customer, Driver, Status, Truck } from "@/types/types";
import {
	currency,
	customer,
	driver,
	loadingPlace,
	status,
	truck,
	unloadingPlace,
} from ".";

const order = pgTable(
	"orders",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		createdAt: timestamp("created_at", { mode: "string" })
			.notNull()
			.defaultNow(),
		updatedAt: timestamp("updated_at", { mode: "string" })
			.notNull()
			.defaultNow(),
		orderNr: text("order_nr").notNull(),
		startDate: date("start_date", { mode: "string" }).notNull().defaultNow(),
		endDate: date("end_date", { mode: "string" }).notNull().defaultNow(),
		statusId: integer("status_id")
			.notNull()
			.references(() => status.id)
			.default(1),
		priceCurrency: numeric("price_currency", {
			precision: 10,
			scale: 2,
		}).notNull(),
		pricePLN: numeric("price_pln", {
			precision: 10,
			scale: 2,
		}).notNull(),
		currencyId: integer("currency_id")
			.notNull()
			.references(() => currency.id),
		currencyRate: numeric("currency_rate", {
			precision: 5,
			scale: 4,
		})
			.notNull()
			.default("1"),
		truckId: integer("truck_id")
			.notNull()
			.references(() => truck.id),
		driverId: integer("driver_id")
			.notNull()
			.references(() => driver.id),
		customerId: integer("customer_id")
			.notNull()
			.references(() => customer.id),
	},
	(table) => [
		unique().on(table.customerId, table.orderNr),
		index("idx_orders_order_nr_lower").using(
			"btree",
			sql`LOWER(${table.orderNr})`,
		),
		index("idex_orders_start_date_date").using(
			"btree",
			sql`DATE(${table.startDate})`,
		),
		index("idex_orders_end_date_date").using(
			"btree",
			sql`DATE(${table.endDate})`,
		),
	],
);

export const ordersWithDetailsView = pgView("orders_with_details", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	createdAt: timestamp("created_at", { mode: "string" }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { mode: "string" }).notNull().defaultNow(),
	orderNr: text("order_nr").notNull(),
	startDate: date("start_date", { mode: "string" }).notNull().defaultNow(),
	endDate: date("end_date", { mode: "string" }).notNull().defaultNow(),
	statusId: integer("status_id")
		.notNull()
		.references(() => status.id),
	priceCurrency: numeric("price_currency", {
		precision: 10,
		scale: 2,
	}).notNull(),
	pricePLN: numeric("price_pln", { precision: 10, scale: 2 }).notNull(),
	currencyId: integer("currency_id")
		.notNull()
		.references(() => currency.id),
	currencyRate: numeric("currency_rate", {
		precision: 5,
		scale: 4,
	}).notNull(),
	truckId: integer("truck_id")
		.notNull()
		.references(() => truck.id),
	driverId: integer("driver_id")
		.notNull()
		.references(() => driver.id),
	customerId: integer("customer_id")
		.notNull()
		.references(() => customer.id),

	// Joined data
	customer_name: text("customer_name").notNull(),
	driver_fullname: text("driver_fullname").notNull(),
	truck_plate: text("truck_plate").notNull(),
	status_name: text("status_name").notNull(),
	currency_code: text("currency_code").notNull(),

	// JSON aggregated data
	customer: json("customer").$type<Customer>().notNull(),
	driver: json("driver").$type<Driver>().notNull(),
	truck: json("truck").$type<Truck>().notNull(),
	status: json("status").$type<Status>().notNull(),
	loadingPlaces: json("loading_places").$type<City[]>().notNull(),
	unloadingPlaces: json("unloading_places").$type<City[]>().notNull(),

	// Helper columns for sorting
	loadingCity: text("loading_city").notNull(),
	unloadingCity: text("unloading_city").notNull(),
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
