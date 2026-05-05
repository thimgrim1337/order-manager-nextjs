import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useFormSubmit from "@/features/OrderForm/hooks/useFormSubmit";

const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const onDialogClose = vi.fn();

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

describe("useFormSubmit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	it("success case", async () => {
		const customer = { id: 1, tax: "PL7743241555", name: "DEVIL" };

		const actionMock = vi.fn().mockResolvedValueOnce({
			success: true,
			data: { name: customer.name },
		});

		const { result } = renderHook(() =>
			useFormSubmit(actionMock, onDialogClose),
		);

		await act(async () => {
			await result.current.submitForm(customer, {
				errorTitle: "Nie udało się zapisać.",
				successTitle: "OK",
				successDescription: "Zlecenie zapisane",
			});
		});

		expect(actionMock).toHaveBeenCalledWith(customer, undefined);
		expect(toastSuccessMock).toHaveBeenCalledWith(
			"OK",
			expect.objectContaining({
				description: "Zlecenie zapisane",
				richColors: true,
			}),
		);
		expect(refreshMock).toHaveBeenCalled();
		expect(onDialogClose).toHaveBeenCalled();
	});

	it("error case", async () => {
		const actionMock = vi.fn().mockResolvedValueOnce({
			message: "API Error",
		});

		const { result } = renderHook(() =>
			useFormSubmit(actionMock, onDialogClose),
		);

		await act(async () => {
			await result.current.submitForm({ foo: "bar" } as unknown, {
				errorTitle: "Nie udało się zapisać.",
				successTitle: "OK",
			});
		});

		expect(actionMock).toHaveBeenCalledWith({ foo: "bar" }, undefined);

		expect(toastErrorMock).toHaveBeenCalledWith(
			"Nie udało się zapisać.",
			expect.objectContaining({
				description: "API Error",
				richColors: true,
			}),
		);

		expect(onDialogClose).not.toHaveBeenCalled();
		expect(refreshMock).not.toHaveBeenCalled();
	});

	it("passes id to action when provided", async () => {
		const actionMock = vi.fn().mockResolvedValueOnce({
			success: true,
			data: {},
		});

		const { result } = renderHook(() =>
			useFormSubmit(actionMock, onDialogClose),
		);

		await act(async () => {
			await result.current.submitForm({ foo: "bar" } as unknown, {}, 42);
		});

		expect(actionMock).toHaveBeenCalledWith({ foo: "bar" }, 42);
	});

	it("uses fallback titles when not provided", async () => {
		const actionMock = vi.fn().mockResolvedValueOnce({ message: "Błąd" });
		const { result } = renderHook(() =>
			useFormSubmit(actionMock, onDialogClose),
		);

		await act(async () => {
			await result.current.submitForm({} as unknown, {}); // brak errorTitle
		});

		expect(toastErrorMock).toHaveBeenCalledWith(
			"Niepowodzenie",
			expect.anything(),
		);
	});
});
