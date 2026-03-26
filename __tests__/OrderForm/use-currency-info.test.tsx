import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import useCurrencyInfo from "@/features/OrderForm/hooks/useCurrencyInfo";
import { worker } from "../mocks/browser";
import { mockHoliday, mockRate } from "../mocks/handlers";
import { createWrapper } from "../utils/wrapper";

describe("useCurrencyInfo", async () => {
	it("return currency rate if date is correct", async () => {
		const { result } = renderHook(() => useCurrencyInfo("2024-01-16"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isRateLoading).toBe(false));

		expect(result.current.rate).toEqual(mockRate);
		expect(result.current.isRateError).toBe(false);
	});

	it("use recieved holidays", async () => {
		worker.use(
			http.get("https://openholidaysapi.org/PublicHolidays", () => {
				return HttpResponse.json([{ ...mockHoliday, endDate: "2024-01-15" }]);
			}),
		);

		const { result } = renderHook(() => useCurrencyInfo("2024-01-16"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => {
			expect(result.current.isRateLoading).toBe(false);
		});

		expect(result.current.rate).toEqual(mockRate);
	});

	it("return isRateLoading: true when fetching", () => {
		const { result } = renderHook(() => useCurrencyInfo("2024-01-16"), {
			wrapper: createWrapper(),
		});

		expect(result.current.isRateLoading).toBe(true);
	});

	it("return isRateError: true when error occured", async () => {
		worker.use(
			http.get(
				"https://api.nbp.pl/api/exchangerates/rates/:table/:code/:date/",
				() => HttpResponse.error(),
			),
		);

		const { result } = renderHook(() => useCurrencyInfo("2024-01-16"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isRateError).toBe(true));

		expect(result.current.rate).toBeUndefined();
	});
});
