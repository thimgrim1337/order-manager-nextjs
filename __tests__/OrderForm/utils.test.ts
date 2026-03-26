import { describe, expect, it } from "vitest";
import { getValidCurrencyDate } from "@/features/OrderForm/lib/utils";

const NO_HOLIDAYS: { endDate: string }[] = [];

describe("getValidCurrencyDate", () => {
	it("return previous bussiness day", () => {
		expect(getValidCurrencyDate("2026-03-24", NO_HOLIDAYS)).toBe("2026-03-23");
	});

	it("return last bussiness day when day is saturday", () => {
		expect(getValidCurrencyDate("2026-03-21", NO_HOLIDAYS)).toBe("2026-03-20");
	});

	it("return last bussiness day when day is sunday", () => {
		expect(getValidCurrencyDate("2026-03-22", NO_HOLIDAYS)).toBe("2026-03-20");
	});

	it("return last bussiness day when day is a holiday", () => {
		const holidays = [{ endDate: "2021-03-24" }];
		expect(getValidCurrencyDate("2021-03-25", holidays)).toBe("2021-03-23");
	});

	it.skip("return last bussiness day when day is in future", () => {
		expect(getValidCurrencyDate("2026-03-27", NO_HOLIDAYS)).toBe("2026-03-24");
	});

	it("return an original date when error occured", () => {
		expect(getValidCurrencyDate("2026-13-27", NO_HOLIDAYS)).toBe("2026-13-27");
	});
});
