import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Suspense } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateOrderForm from "@/features/OrderForm/components/create-order-form";
import { OrderDataProvider } from "@/features/shared/context/order-context";
import { searchCustomers } from "@/lib/actions";

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

vi.mock("@/lib/actions", () => ({
	searchCustomers: vi.fn(),
	createCity: vi.fn(),
	createCustomer: vi.fn(),
	createOrder: vi.fn(),
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
	vi.mocked(searchCustomers).mockResolvedValue([
		{ id: 1, name: "DEVIL", tax: "7743241555" },
	]);

	mockUseCurrencyInfo.mockReturnValue({
		rate: null,
		isRateLoading: false,
		isRateError: false,
		rateError: null,
	});
});

const dataPromiseMock = {
	cities: Promise.resolve([
		{
			id: 1,
			name: "Płock",
			postal: "09-410",
			countryId: 39,
		},
	]),
	customers: Promise.resolve([
		{
			id: 1,
			name: "DEVIL",
			tax: "7743241555",
		},
	]),
	drivers: Promise.resolve([
		{
			id: 1,
			firstName: "Jan",
			lastName: "Kowalski",
		},
	]),
	trucks: Promise.resolve([
		{
			id: 1,
			plate: "WND0997C",
			insuranceEndAt: "2026-06-01",
			serviceEndAt: "2026-06-01",
			driverId: 1,
		},
	]),
	countries: Promise.resolve([
		{
			id: 1,
			name: "Poland",
			code: "PL",
		},
	]),
	currencies: Promise.resolve([
		{ id: 1, code: "PLN" },
		{ id: 2, code: "EUR" },
	]),
};

const setup = async (customData?: Partial<typeof dataPromiseMock>) => {
	const user = userEvent.setup({ pointerEventsCheck: 0 });

	await act(async () => {
		render(
			<OrderDataProvider dataPromise={{ ...dataPromiseMock, ...customData }}>
				<Suspense fallback={"Loading..."}>
					<CreateOrderForm onDialogClose={vi.fn()} />
				</Suspense>
			</OrderDataProvider>,
		);
	});

	return { user };
};

describe("CreateOrderForm", () => {
	describe("render", () => {
		it("render form with inputs, labels and buttons", async () => {
			await setup();
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
				isLoading: false,
				isError: false,
				error: null,
			});

			const { user } = await setup();

			await user.click(screen.getByText("Waluta"));
			const eurOption = await screen.findByRole("option", { name: "EUR" }); // findBy waits
			await user.click(eurOption);

			await waitFor(() =>
				screen.getByText(
					"Tabela nr 010/A/NBP/2024 z dnia 2024-01-15, 1 EUR = 4.25 PLN",
				),
			);
		});

		it("not show currencyInfo when currency is PLN", async () => {
			const { user } = await setup();

			await user.click(screen.getByLabelText("Waluta"));
			const plnOption = await screen.findByRole("option", { name: "PLN" }); // findBy waits
			await user.click(plnOption);

			expect(screen.queryByText(/Tabela nr/i)).not.toBeInTheDocument();
		});

		it("show spinner when currency is loading", async () => {
			mockUseCurrencyInfo.mockReturnValue({
				rate: mockRate,
				isLoading: true,
				isError: false,
				error: null,
			});

			const { user } = await setup();

			await user.click(screen.getByLabelText("Waluta"));
			const eurOption = await screen.findByRole("option", { name: "EUR" }); // findBy waits
			await user.click(eurOption);

			await waitFor(() => screen.getByText("Pobieranie kursu waluty..."));
		});
	});

	describe("auto-assign driver", () => {
		it("auto-assign driver when truck is selected", async () => {
			const { user } = await setup();

			expect(screen.getByPlaceholderText("Wybierz kierowcę"));
			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WND0997C" }));
			await waitFor(() => screen.getByDisplayValue("Jan Kowalski"));
		});

		it("do nothing when when is no driver assigned before", async () => {
			const { user } = await setup({
				trucks: Promise.resolve([
					{
						id: 1,
						plate: "WND0997C",
						insuranceEndAt: "2026-06-01",
						serviceEndAt: "2026-06-01",
						driverId: 0,
					},
				]),
			});

			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WND0997C" }));

			expect(screen.queryByText("Jan Kowalski")).not.toBeInTheDocument();
		});
	});

	describe("submit", () => {
		it("call submitForm and resetFilters when correct data are provided", async () => {
			const { user } = await setup();

			await user.click(screen.getByLabelText("Zleceniodawca"));
			await user.click(screen.getByRole("option", { name: "DEVIL" }));

			await user.type(screen.getByLabelText("Numer zlecenia"), "12345");

			await user.click(screen.getByLabelText("Data załadunku"));

			await user.click(screen.getByRole("gridcell", { name: "12" }));

			await user.click(screen.getByLabelText("Data rozładunku"));

			await user.click(screen.getByRole("gridcell", { name: "13" }));

			await user.click(screen.getByLabelText("Miejsca załadunku"));
			await user.click(screen.getByRole("option", { name: "Płock" }));

			await user.click(screen.getByLabelText("Miejsca rozładunku"));
			await user.click(screen.getByRole("option", { name: "Płock" }));

			await user.type(screen.getByLabelText("Cena w walucie"), "1000");

			await user.click(screen.getByLabelText("Pojazd"));
			await user.click(screen.getByRole("option", { name: "WND0997C" }));

			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).toHaveBeenCalledTimes(1);
			expect(resetFiltersMock).toHaveBeenCalledTimes(1);
		});

		it("not call submitForm and resetFilters when no or uncorrect data are provided", async () => {
			const { user } = await setup();

			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).not.toHaveBeenCalled();
			expect(resetFiltersMock).not.toHaveBeenCalled();
		});

		it("reset form when click reset button", async () => {
			const { user } = await setup();

			await user.type(screen.getByLabelText("Numer zlecenia"), "12345");

			await user.click(screen.getByRole("button", { name: "Reset" }));

			expect(screen.queryByText("12345")).not.toBeInTheDocument();
		});
	});
});
