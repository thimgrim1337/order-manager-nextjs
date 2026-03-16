import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import useFormSubmit from "@/features/OrderForm/hooks/useFormSubmit";

const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
		error: toastErrorMock,
	},
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: refreshMock }),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

it("success case", async () => {
	const onDialogClose = vi.fn();
	const customer = { tax: "PL7743241555", name: "DEVIL" };

	const actionMock = vi.fn().mockResolvedValueOnce({
		success: true,
		data: { name: customer.name },
	});

	const { result } = renderHook(() =>
		useFormSubmit({
			action: actionMock,
			onDialogClose,
		}),
	);

	await act(async () => {
		await result.current.submitForm(customer, {
			errorTitle: "Nie udało się zapisać.",
			successTitle: "OK",
		});
	});

	expect(actionMock).toBeCalledWith(customer);
	expect(toastSuccessMock).toBeCalledWith(
		"OK",
		expect.objectContaining({
			richColors: true,
		}),
	);
	expect(refreshMock).toBeCalled();
	expect(onDialogClose).toBeCalled();
});

it("error case", async () => {
	const onDialogClose = vi.fn();

	const actionMock = vi.fn().mockResolvedValueOnce({
		message: "API Error",
	});

	const { result } = renderHook(() =>
		useFormSubmit({
			action: actionMock,
			onDialogClose,
		}),
	);

	await act(async () => {
		await result.current.submitForm({ foo: "bar" } as unknown, {
			errorTitle: "Nie udało się zapisać.",
			successTitle: "OK",
		});
	});

	expect(actionMock).toBeCalledWith({ foo: "bar" });

	expect(toastErrorMock).toBeCalledWith(
		"Nie udało się zapisać.",
		expect.objectContaining({
			description: "API Error",
			richColors: true,
		}),
	);

	expect(onDialogClose).not.toBeCalled();
	expect(refreshMock).not.toBeCalled();
});
