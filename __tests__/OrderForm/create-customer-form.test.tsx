import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateCustomerForm from "@/features/OrderForm/components/CustomerForm/create-customer-form";

const submitFormMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/OrderForm/hooks/useFormSubmit", () => ({
	default: () => ({ submitForm: submitFormMock }),
}));

beforeEach(() => {
	vi.clearAllMocks();
});

const setup = () => {
	const user = userEvent.setup();
	render(<CreateCustomerForm onDialogClose={vi.fn()} />);

	return { user };
};

describe("CreateCustomerForm", () => {
	describe("render", () => {
		it("render form with inputs and button", () => {
			setup();

			screen.getByLabelText("NIP");
			screen.getByLabelText("Nazwa zleceniodawcy");
			screen.getByRole("button", { name: "Dodaj" });
		});
	});

	describe("submit", () => {
		it("call submitForm when click on button", async () => {
			const { user } = setup();

			const taxInput = screen.getByLabelText("NIP");
			const nameInput = screen.getByLabelText("Nazwa zleceniodawcy");
			const submitButton = screen.getByRole("button", { name: "Dodaj" });

			await user.type(taxInput, "PL7743241555");
			await user.type(nameInput, "DEVIL");

			await user.click(submitButton);

			expect(submitFormMock).toHaveBeenCalledOnce();
		});
	});

	it("not call submitForm when no or uncorrect data are provided", async () => {
		const { user } = setup();

		await user.click(screen.getByRole("button", { name: "Dodaj" }));

		expect(submitFormMock).not.toHaveBeenCalled();
	});
});
