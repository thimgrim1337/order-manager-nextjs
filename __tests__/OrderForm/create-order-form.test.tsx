import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateOrderForm from "@/features/OrderForm/components/create-order-form";

const submitFormMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/OrderForm/hooks/useFormSubmit", () => ({
	default: () => ({ submitForm: submitFormMock }),
}));

const resetFiltersMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/shared/hooks/useFilters", () => ({
	default: () => ({
		setFilters: vi.fn(),
		resetFilters: resetFiltersMock,
	}),
}));

const mockUseCurrencyInfo = vi.hoisted(() => vi.fn());
vi.mock("@/features/OrderForm/hooks/useCurrencyInfo", () => ({
	default: (...args: unknown[]) => mockUseCurrencyInfo(...args),
}));

const mockRate = {
	rates: [
		{
			effectiveDate: "2024-01-15",
			mid: 4.25,
			no: "010/A/NBP/2024",
		},
	],
};

beforeEach(() => {
	vi.clearAllMocks();
	mockUseCurrencyInfo.mockReturnValue({
		rate: null,
		isRateLoading: false,
		isRateError: false,
		rateError: null,
	});
});

describe("CreateOrderForm", () => {
	const user = userEvent.setup({ pointerEventsCheck: 0 });
	describe("render", () => {
		it("render form with inputs, labels and buttons", () => {
			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[]}
					trucks={[]}
					onDialogClose={vi.fn()}
				/>,
			);

			screen.getByLabelText("Zleceniodawca");
			screen.getByLabelText("Numer zlecenia");
			screen.getByLabelText("Data załadunku");
			screen.getByLabelText("Data rozładunku");
			screen.getByLabelText("Cena w walucie");
			screen.getByLabelText("Waluta");
			screen.getByLabelText("Pojazd");
			screen.getByLabelText("Kierowca");

			screen.getByLabelText("Dodawanie nowego zleceniodawcy");
			screen.getByLabelText("Dodawanie nowego miejsca");

			screen.getByRole("button", { name: "Dodaj" });
			screen.getByRole("button", { name: "Reset" });
		});
	});

	describe("currency", () => {
		it("set and show currencyInfo when EUR currency is picked", async () => {
			mockUseCurrencyInfo.mockReturnValue({
				rate: mockRate,
				isRateLoading: false,
				isRateError: false,
				rateError: null,
			});

			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[]}
					trucks={[]}
					onDialogClose={vi.fn()}
				/>,
			);

			await user.click(screen.getByLabelText("Waluta"));
			await user.click(screen.getByRole("option", { name: "EUR" }));

			await waitFor(() =>
				screen.getByText(
					"Tabela nr 010/A/NBP/2024 z dnia 2024-01-15, 1 EUR = 4.25 PLN",
				),
			);
		});

		it("not show currencyInfo when currency is PLN", async () => {
			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[]}
					trucks={[]}
					onDialogClose={vi.fn()}
				/>,
			);

			await user.click(screen.getByLabelText("Waluta"));
			await user.click(screen.getByRole("option", { name: "PLN" }));

			expect(screen.queryByText(/Tabela nr/i)).not.toBeInTheDocument();
		});

		it("show spinner when currency is loading", async () => {
			mockUseCurrencyInfo.mockReturnValue({
				rate: mockRate,
				isRateLoading: true,
				isRateError: false,
				rateError: null,
			});

			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[]}
					trucks={[]}
					onDialogClose={vi.fn()}
				/>,
			);

			await user.click(screen.getByLabelText("Waluta"));
			await user.click(screen.getByRole("option", { name: "EUR" }));

			await waitFor(() => screen.getByText("Pobieranie kursu waluty..."));
		});
	});

	describe("auto-assign driver", () => {
		it("auto-assign driver when truck is selected", async () => {
			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[{ id: 1, firstName: "Dawid", lastName: "Dygner" }]}
					trucks={[
						{
							id: 1,
							plate: "WP0997C",
							driverId: 1,
							insuranceEndAt: "2026-03-30",
							serviceEndAt: "2026-03-30",
						},
					]}
					onDialogClose={vi.fn()}
				/>,
			);

			expect(screen.getByLabelText("Kierowca")).toHaveTextContent(
				"Wybierz kierowcę",
			);
			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WP0997C" }));
			await waitFor(() => screen.getByText("Dawid Dygner"));
		});

		it("do nothing when when is no driver assigned before", async () => {
			render(
				<CreateOrderForm
					cities={[]}
					countries={[]}
					customers={[]}
					drivers={[{ id: 1, firstName: "Dawid", lastName: "Dygner" }]}
					trucks={[
						{
							id: 1,
							plate: "WP0997C",
							driverId: null,
							insuranceEndAt: "2026-03-30",
							serviceEndAt: "2026-03-30",
						},
					]}
					onDialogClose={vi.fn()}
				/>,
			);

			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WP0997C" }));

			await waitFor(() =>
				expect(screen.queryByText("Dawid Dygner")).not.toBeInTheDocument(),
			);
		});
	});

	describe("submit", () => {
		beforeEach(() => {
			render(
				<CreateOrderForm
					cities={[
						{ countryId: 1, id: 1, name: "Płock", postal: "09-400" },
						{ countryId: 1, id: 2, name: "Braniewo", postal: "14-500" },
					]}
					countries={[
						{
							code: "PL",
							id: 1,
							name: "Poland",
						},
					]}
					customers={[
						{
							id: 1,
							name: "test",
							tax: "PL123456789",
						},
					]}
					drivers={[{ id: 1, firstName: "Dawid", lastName: "Dygner" }]}
					trucks={[
						{
							id: 1,
							plate: "WP0997C",
							driverId: 1,
							insuranceEndAt: "2026-03-30",
							serviceEndAt: "2026-03-30",
						},
					]}
					onDialogClose={vi.fn()}
				/>,
			);
		});

		it("call submitForm and resetFilters when correct data are provided", async () => {
			await user.click(screen.getByLabelText("Zleceniodawca"));
			await user.click(screen.getByRole("option", { name: "test" }));

			await user.type(screen.getByLabelText("Numer zlecenia"), "12345");

			await user.click(screen.getByLabelText("Data załadunku"));
			await user.click(screen.getByRole("gridcell", { name: "12" }));

			await user.click(screen.getByLabelText("Data rozładunku"));
			await user.click(screen.getByRole("gridcell", { name: "13" }));

			await user.click(screen.getByLabelText("Miejsca załadunku"));
			await user.click(screen.getByRole("option", { name: "Płock" }));

			await user.click(screen.getByLabelText("Miejsca rozładunku"));
			await user.click(screen.getByRole("option", { name: "Braniewo" }));

			await user.type(screen.getByLabelText("Cena w walucie"), "1000");

			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WP0997C" }));

			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).toHaveBeenCalledTimes(1);
			expect(resetFiltersMock).toHaveBeenCalledTimes(1);
		});

		it("not call submitForm and resetFilters when no or uncorrect data are provided", async () => {
			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).not.toHaveBeenCalled();
			expect(resetFiltersMock).not.toHaveBeenCalled();
		});

		it("reset form when click reset button", async () => {
			await user.type(screen.getByLabelText("Numer zlecenia"), "12345");

			await user.click(screen.getByRole("button", { name: "Reset" }));

			expect(screen.queryByText("12345")).not.toBeInTheDocument();
		});
	});
});
