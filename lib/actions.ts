"use server";

import { revalidatePath } from "next/cache";
import { CreateCityDto } from "./dto/city.dto";
import { CreateCustomerDto } from "./dto/customer.dto";
import { CreateOrderFormDto } from "./dto/order.dto";
import { createCityService } from "./services/city.services";
import { createCustomerService } from "./services/customer.services";
import { createOrderService } from "./services/order.services";

export type ActionResponse<T> = Promise<
	| { success: true; data: T; message?: string }
	| { message?: string; details?: unknown }
>;

export async function createOrder(formData: CreateOrderFormDto) {
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
				message: "Nieprawidłowe dane.",
				details: error.details,
			};
		}
		case "OrderExist": {
			return {
				message: "Zlecenie o tym numerze już istnieje.",
			};
		}
		case "UnexpectedError": {
			return {
				message: "Wystąpił nieznany błąd.",
				details: error.details,
			};
		}
		default: {
			throw new Error(`Unhandled error: ${reason satisfies never}`);
		}
	}
}

export async function createCustomer(formData: CreateCustomerDto) {
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

export async function createCity(formData: CreateCityDto) {
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
