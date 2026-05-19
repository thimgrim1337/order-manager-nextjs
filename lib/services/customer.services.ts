import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import z from "zod";
import { createCustomer } from "../dal/customer.dal.";
import {
	createCustomerSchema,
	selectCustomerSchema,
} from "../dto/customer.dto";
import { error, ok } from "../error";
import { getErrorDetails } from "../helpers";

export async function createCustomerService(rawData: unknown) {
	const validationResult = createCustomerSchema.safeParse(rawData);

	if (!validationResult.success)
		return error({
			reason: "InvalidData",
			details: z.prettifyError(validationResult.error),
		});

	try {
		const dbCustomer = await createCustomer(validationResult.data);

		return ok(selectCustomerSchema.parse(dbCustomer));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			const cause = err.cause as DatabaseError | undefined;

			if (cause?.code === "23505") {
				return error({
					reason: "CustomerExist",
				});
			}

			return error({
				reason: "DrizzleError",
				details: getErrorDetails(err),
			});
		}

		return error({
			reason: "UnexpectedError",
			details: getErrorDetails(err),
		});
	}
}
