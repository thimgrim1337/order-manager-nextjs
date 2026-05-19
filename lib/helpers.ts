import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

type ApiResult<TData = unknown> =
	| { type: "success"; data: TData; status: number }
	| { type: "error"; error: string; status: number };

export async function apiCall<TData>(
	url: string,
	init?: RequestInit,
): Promise<ApiResult<TData>> {
	const response = await fetch(url, init);

	if (!response.ok) {
		let message = "An error occurred when fetching data.";

		try {
			const erroBody = await response.json();
			if (typeof erroBody?.message === "string") {
				message = erroBody.message;
			}
		} catch {}

		return {
			type: "error",
			error: message,
			status: response.status,
		};
	}

	return {
		type: "success",
		data: response.json() as TData,
		status: response.status,
	};
}

export function getErrorDetails(error: unknown) {
	if (error instanceof Error) {
		const base = {
			name: error.name,
			message: error.message,
			stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
		};

		if (error instanceof DrizzleQueryError) {
			const cause = error.cause as DatabaseError | undefined;

			if (cause?.code === "23505") {
				return {
					...base,
					message: cause.message,
					detail: cause.detail,
					constraint: cause.constraint,
				};
			}

			return {
				...base,
				drizzleMessage: error.message,
				postgres: cause
					? {
							code: cause.code,
							message: cause.message,
							detail: cause.detail,
							hint: cause.hint,
							table: cause.table,
							column: cause.column,
							constraint: cause.constraint,
							schema: cause.schema,
						}
					: undefined,
			};
		}

		return base;
	}

	return {
		message: "Uknown trown value",
		raw: String(error),
	};
}
