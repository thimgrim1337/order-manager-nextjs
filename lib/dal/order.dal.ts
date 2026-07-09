import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	InferSelectModel,
	InferSelectViewModel,
	ilike,
	lte,
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
import { OrderFilters, PlaceType, SortParams } from "@/types/types";
import { CityDto } from "../dto/city.dto";
import { CreateOrderDto, UpdateOrderDto } from "../dto/order.dto";
import { analyzeGlobalFiltering } from "../utils";

export type DbOrderView = InferSelectViewModel<typeof ordersWithDetailsView>;
export type DbOrder = InferSelectModel<typeof order>;

export async function getAllOrders(
	pageIndex: number,
	pageSize: number,
	sortParams?: SortParams[],
	filters?: Partial<OrderFilters>,
) {
	const getSortColumn = (sortParams?: SortParams[]) => {
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
			currencyId: ordersWithDetailsView.currencyId,
			customerId: ordersWithDetailsView.customerId,
			driverId: ordersWithDetailsView.driverId,
		};

		return (
			sortParams?.map((param) => {
				const col = sortMappings[param.id as keyof typeof sortMappings];
				return param.desc ? desc(col) : asc(col);
			}) || [ordersWithDetailsView.id]
		);
	};

	const sortColumn = getSortColumn(sortParams);

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

	const andWhereConditions = [];

	if (filters?.startDate) {
		andWhereConditions.push(
			gte(ordersWithDetailsView.startDate, filters.startDate),
		);
	}

	if (filters?.endDate) {
		andWhereConditions.push(
			lte(ordersWithDetailsView.endDate, filters.endDate),
		);
	}

	if (filters?.driverId) {
		andWhereConditions.push(
			eq(ordersWithDetailsView.driverId, filters.driverId),
		);
	}

	const whereConditions = or(...searchConditions, and(...andWhereConditions));

	return db
		.select()
		.from(ordersWithDetailsView)
		.where(whereConditions)
		.orderBy(...sortColumn)
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
