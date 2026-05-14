import { DrizzleQueryError } from "drizzle-orm";
import z from "zod";
import db from "@/db/db";
import {
	addOrderPlaces,
	checkIfOrderExist,
	createOrder,
	deleteOrder,
	deleteOrderPlaces,
	updateOrder,
} from "../dal/order.dal";
import { updateTruckAssignedDriver } from "../dal/truck.dal";
import {
	OrderFormSchema,
	selectOrderSchema,
	updateOrderSchema,
} from "../dto/order.dto";
import { error, ok } from "../error";

export async function createOrderService(rawData: unknown) {
	const validationResult = OrderFormSchema.safeParse(rawData);

	if (!validationResult.success)
		return error({
			reason: "InvalidData",
			details: z.prettifyError(validationResult.error),
		});

	const validatedData = validationResult.data;

	const { loadingPlaces, unloadingPlaces, currencyInfo, ...order } =
		validatedData;

	const isOrderExist = await checkIfOrderExist(order.orderNr, order.customerId);

	if (isOrderExist)
		return error({
			reason: "OrderExist",
		});

	let pricePLN: string;
	let currencyRate: string = "1";

	if (order.currencyId !== 1 && currencyInfo.rate) {
		currencyRate = currencyInfo.rate;
		pricePLN = String(+order.priceCurrency * +currencyRate);
	} else {
		pricePLN = order.priceCurrency;
	}

	const newOrder = {
		...order,
		pricePLN,
		currencyRate,
	};

	try {
		const dbOrder = await db.transaction(async (trx) => {
			const order = await createOrder(newOrder, trx);

			await addOrderPlaces(order.id, loadingPlaces, "loadingPlace", trx);
			await addOrderPlaces(order.id, unloadingPlaces, "unloadingPlace", trx);
			await updateTruckAssignedDriver(order.truckId, order.driverId, trx);

			return order;
		});

		return ok(selectOrderSchema.parse(dbOrder));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			return error({
				reason: "DrizzleError",
				details: err.cause,
			});
		}

		return error({
			reason: `UnexpectedError`,
			details: err,
		});
	}
}

export async function updateOrderService(orderId: number, rawData: unknown) {
	const validationResult = OrderFormSchema.safeParse(rawData);
	if (!validationResult.success)
		return error({
			reason: "InvalidData",
			details: z.prettifyError(validationResult.error),
		});

	const { loadingPlaces, unloadingPlaces, ...order } = validationResult.data;

	try {
		const dbOrder = await db.transaction(async (trx) => {
			const updatedOrder = updateOrder(orderId, order, trx);
			await deleteOrderPlaces(orderId, "loadingPlace", trx);
			await deleteOrderPlaces(orderId, "unloadingPlace", trx);
			await addOrderPlaces(orderId, loadingPlaces, "loadingPlace", trx);
			await addOrderPlaces(orderId, unloadingPlaces, "unloadingPlace", trx);
			await updateTruckAssignedDriver(order.truckId, order.driverId, trx);

			return updatedOrder;
		});

		return ok(selectOrderSchema.parse(dbOrder));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			return error({
				reason: "DrizzleError",
				details: err.cause,
			});
		}
		return error({
			reason: `UnexpectedError`,
			details: err,
		});
	}
}

export async function patchOrderService(orderId: number, rawData: unknown) {
	const validationResult = updateOrderSchema.safeParse(rawData);

	if (!validationResult.success)
		return error({
			reason: "InvalidData",
			details: z.prettifyError(validationResult.error),
		});

	const validatedData = validationResult.data;

	try {
		const dbOrder = await updateOrder(orderId, validatedData);

		return ok(selectOrderSchema.parse(dbOrder));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			return error({
				reason: "DrizzleError",
				details: err.cause,
			});
		}
		return error({
			reason: `UnexpectedError`,
			details: err,
		});
	}
}

export async function deleteOrderService(orderId: number) {
	try {
		const dbOrder = await db.transaction(async (trx) => {
			await deleteOrderPlaces(orderId, "loadingPlace", trx);
			await deleteOrderPlaces(orderId, "unloadingPlace", trx);
			const order = await deleteOrder(orderId, trx);

			return order;
		});

		return ok(selectOrderSchema.parse(dbOrder));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			return error({
				reason: "DrizzleError",
				details: err.cause,
			});
		}
		return error({
			reason: `UnexpectedError`,
			details: err,
		});
	}
}
