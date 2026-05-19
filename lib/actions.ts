"use server";

import { revalidatePath } from "next/cache";
import { getAllCustomers } from "./dal/customer.dal.";
import { CityDto, CreateCityDto } from "./dto/city.dto";
import { CreateCustomerDto, CustomerDto } from "./dto/customer.dto";
import { OrderDto, OrderFormDto, UpdateOrderDto } from "./dto/order.dto";
import { createCityService } from "./services/city.services";
import { createCustomerService } from "./services/customer.services";
import {
	createOrderService,
	deleteOrderService,
	patchOrderService,
	updateOrderService,
} from "./services/order.services";

export type ActionResponse<T> =
	| { success: true; data: T; message?: string }
	| { success: false; message?: string; details?: unknown };

export async function createOrder(
	formData: OrderFormDto,
): Promise<ActionResponse<OrderDto>> {
	const [error, order] = await createOrderService(formData);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: order,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "InvalidData": {
			return {
				success: false,
				message: "Nieprawidłowe dane.",
				details: String(error.details),
			};
		}
		case "OrderExist": {
			return {
				success: false,
				message: "Zlecenie o tym numerze już istnieje.",
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function updateOrder(
	data: OrderFormDto,
	orderId?: number,
): Promise<ActionResponse<OrderDto>> {
	if (!orderId)
		return {
			success: false,
			message: "Brak Id zlecenia",
		};

	const [error, order] = await updateOrderService(orderId, data);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: order,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "InvalidData": {
			return {
				success: false,
				message: "Nieprawidłowe dane.",
				details: error.details,
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		case "OrderExist": {
			return {
				success: false,
				message: "Zlecenie o tym numerze już istnieje.",
			};
		}
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function patchOrder(
	orderId: number,
	data: Pick<UpdateOrderDto, "statusId">,
): Promise<ActionResponse<OrderDto>> {
	const [error, order] = await patchOrderService(orderId, data);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: order,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "InvalidData": {
			return {
				success: false,
				message: "Nieprawidłowe dane.",
				details: error.details,
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		case "OrderExist": {
			return {
				success: false,
				message: "Zlecenie o tym numerze już istnieje.",
			};
		}
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function deleteOrder(
	orderId: number,
): Promise<ActionResponse<OrderDto>> {
	const [error, order] = await deleteOrderService(orderId);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: order,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function searchCustomers(query: string) {
	return getAllCustomers(query);
}

export async function createCustomer(
	formData: CreateCustomerDto,
): Promise<ActionResponse<CustomerDto>> {
	const [error, customer] = await createCustomerService(formData);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: customer,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "InvalidData": {
			return {
				success: false,
				message: "Nieprawidłowe dane.",
				details: error.details,
			};
		}
		case "CustomerExist": {
			return {
				success: false,
				message: "Ten zleceniodawca już istnieje.",
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function createCity(
	formData: CreateCityDto,
): Promise<ActionResponse<CityDto>> {
	const [error, customer] = await createCityService(formData);

	if (error === null) {
		revalidatePath("/orders");
		return {
			success: true,
			data: customer,
		};
	}

	const reason = error.reason;
	switch (reason) {
		case "InvalidData": {
			return {
				success: false,
				message: "Nieprawidłowe dane.",
				details: error.details,
			};
		}
		case "CityExist": {
			return {
				success: false,
				message: "Ta miejscowość już istnieje.",
			};
		}
		case "DrizzleError": {
			return {
				success: false,
				message: "Wystąpił błąd bazy danych",
				details: error.details,
			};
		}
		case "UnexpectedError": {
			return {
				success: false,
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}
