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
