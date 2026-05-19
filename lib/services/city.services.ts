import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import z from "zod";
import { createCity } from "../dal/city.dal";
import { createCitySchema, selectCitySchema } from "../dto/city.dto";
import { error, ok } from "../error";
import { getErrorDetails } from "../helpers";

export async function createCityService(rawData: unknown) {
	const validationResult = createCitySchema.safeParse(rawData);
	if (!validationResult.success)
		return error({
			reason: "InvalidData",
			details: z.prettifyError(validationResult.error),
		});

	try {
		const dbCity = await createCity(validationResult.data);

		return ok(selectCitySchema.parse(dbCity));
	} catch (err) {
		if (err instanceof DrizzleQueryError) {
			const cause = err.cause as DatabaseError | undefined;

			if (cause?.code === "23505") {
				return error({
					reason: "CityExist",
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
