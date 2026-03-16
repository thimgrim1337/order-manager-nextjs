import {
	and,
	asc,
	count,
	desc,
	eq,
	InferSelectModel,
	InferSelectViewModel,
	ilike,
	or,
	SQL,
	sql,
} from "drizzle-orm";
import db, { dbTransaction } from "@/db/db";
import {
	loadingPlace,
	order,
	ordersWithDetailsView,
	unloadingPlace,
} from "@/db/schemas";
import { SortOptions } from "@/types/types";
import { CityDto } from "../dto/city.dto";
import { CreateOrderDto } from "../dto/order.dto";
import { analyzeGlobalFiltering } from "../utils";

export type DbOrderView = InferSelectViewModel<typeof ordersWithDetailsView>;
export type DbOrder = InferSelectModel<typeof order>;

export async function getAllOrders(
	pageIndex: number,
	pageSize: number,
	sortOptions?: SortOptions,
	filters?: string,
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
			currency: ordersWithDetailsView.currency,
		};

		return (
			sortMappings[field as keyof typeof sortMappings] ??
			ordersWithDetailsView.id
		);
	};

	let whereConditions: SQL | undefined;
	if (filters) {
		const { searchTerm, isNumeric, numericValue, isDate, normalizedDate } =
			analyzeGlobalFiltering(filters);

		const searchConditions = [
			ilike(ordersWithDetailsView.orderNr, searchTerm),
			ilike(ordersWithDetailsView.customer, searchTerm),
			ilike(ordersWithDetailsView.driver, searchTerm),
			ilike(ordersWithDetailsView.truck, searchTerm),
			ilike(ordersWithDetailsView.status, searchTerm),
			ilike(ordersWithDetailsView.currency, searchTerm),
			ilike(ordersWithDetailsView.loadingCity, searchTerm),
			ilike(ordersWithDetailsView.unloadingCity, searchTerm),
		];

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

		whereConditions = or(...searchConditions);
	}
	2;
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

export async function checkIfOrderExist(
	orderNumber: string,
	customerId: number,
) {
	const dbOrder = await db.query.order.findFirst({
		where: (order) =>
			and(eq(order.orderNr, orderNumber), eq(order.customerId, customerId)),
	});

	return dbOrder ? true : false;
}

export async function createOrder(dto: CreateOrderDto, trx: dbTransaction) {
	const [newOrder] = await trx.insert(order).values(dto).returning();
	return newOrder;
}

export async function addOrderPlaces(
	orderId: number,
	cities: CityDto[],
	placeType: "loadingPlace" | "unloadingPlace",
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
