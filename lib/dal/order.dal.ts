import {
	asc,
	count,
	desc,
	eq,
	InferSelectModel,
	InferSelectViewModel,
	ilike,
	or,
	sql,
} from "drizzle-orm";
import db, { dbTransaction } from "@/db/db";
import {
	loadingPlace,
	order,
	ordersWithDetailsView,
	unloadingPlace,
} from "@/db/schemas";
import { OrderFilters, PlaceType, SortOptions } from "@/types/types";
import { CityDto } from "../dto/city.dto";
import { CreateOrderDto, UpdateOrderDto } from "../dto/order.dto";
import { analyzeGlobalFiltering } from "../utils";

export type DbOrderView = InferSelectViewModel<typeof ordersWithDetailsView>;
export type DbOrder = InferSelectModel<typeof order>;

export async function getAllOrders(
	pageIndex: number,
	pageSize: number,
	sortOptions?: SortOptions,
	filters?: OrderFilters,
) {
	const sortOrder = sortOptions?.desc === true ? desc : asc;

	const getSortColumn = (field?: string) => {
		const sortMappings = {
			statusId: ordersWithDetailsView.statusId,
			truckId: ordersWithDetailsView.truckId,
			loadingCity: ordersWithDetailsView.loadingCity,
			unloadingCity: ordersWithDetailsView.unloadingCity,
			orderNr: ordersWithDetailsView.orderNr,
			startDate: ordersWithDetailsView.startDate,
			endDate: ordersWithDetailsView.endDate,
			pricePLN: ordersWithDetailsView.pricePLN,
			priceCurrency: ordersWithDetailsView.priceCurrency,
			currency: ordersWithDetailsView.currencyCode,
		};

		return (
			sortMappings[field as keyof typeof sortMappings] ??
			ordersWithDetailsView.id
		);
	};

	const searchConditions = [];
	if (filters?.globalFilters) {
		const { searchTerm, isNumeric, numericValue, isDate, normalizedDate } =
			analyzeGlobalFiltering(filters.globalFilters);

		searchConditions.push(
			ilike(ordersWithDetailsView.orderNr, searchTerm),
			ilike(ordersWithDetailsView.customerName, searchTerm),
			ilike(ordersWithDetailsView.driverFullname, searchTerm),
			ilike(ordersWithDetailsView.truckPlate, searchTerm),
			ilike(ordersWithDetailsView.statusName, searchTerm),
			ilike(ordersWithDetailsView.currencyCode, searchTerm),
			ilike(ordersWithDetailsView.loadingCity, searchTerm),
			ilike(ordersWithDetailsView.unloadingCity, searchTerm),
		);

		if (isNumeric) {
			searchConditions.push(
				sql`${ordersWithDetailsView.pricePLN}::numeric BETWEEN ${
					numericValue - 1
				} AND ${numericValue + 1}`,
				sql`${ordersWithDetailsView.priceCurrency}::numeric BETWEEN ${
					numericValue - 1
				} AND ${numericValue + 1}`,
			);
		}

		if (isDate) {
			searchConditions.push(
				eq(sql`DATE(${ordersWithDetailsView.startDate})`, normalizedDate),
				eq(sql`DATE(${ordersWithDetailsView.endDate})`, normalizedDate),
			);
		}
	}

	if (filters?.truckId) {
		searchConditions.push(eq(ordersWithDetailsView.truckId, filters.truckId));
	}

	const whereConditions = or(...searchConditions);

	return db
		.select()
		.from(ordersWithDetailsView)
		.where(whereConditions)
		.orderBy(sortOrder(getSortColumn(sortOptions?.id)))
		.limit(pageSize)
		.offset(pageIndex * pageSize);
}

export async function getOrderCount() {
	return db.select({ count: count() }).from(order);
}

export async function createOrder(dto: CreateOrderDto, trx: dbTransaction) {
	const [newOrder] = await trx.insert(order).values(dto).returning();
	return newOrder;
}

export async function addOrderPlaces(
	orderId: number,
	cities: CityDto[],
	placeType: PlaceType,
	trx: dbTransaction,
) {
	const places = cities.map((city) => ({
		orderId,
		placeId: city.id,
	}));
	const table = placeType === "loadingPlace" ? loadingPlace : unloadingPlace;
	const dbPlaces = await trx.insert(table).values(places).returning();

	return dbPlaces;
}

export async function deleteOrderPlaces(
	orderId: number,
	placeType: PlaceType,
	trx: dbTransaction,
) {
	const table = placeType === "loadingPlace" ? loadingPlace : unloadingPlace;
	const dbPlaces = await trx
		.delete(table)
		.where(eq(table.orderId, orderId))
		.returning();

	return dbPlaces;
}

export async function updateOrder(
	orderId: number,
	dto: UpdateOrderDto,
	trx?: dbTransaction,
) {
	const [dbOrder] = await (trx ? trx : db)
		.update(order)
		.set(dto)
		.where(eq(order.id, orderId))
		.returning();

	return dbOrder;
}

export async function deleteOrder(orderId: number, trx: dbTransaction) {
	const [dbOrder] = await trx
		.delete(order)
		.where(eq(order.id, orderId))
		.returning();

	return dbOrder;
}
