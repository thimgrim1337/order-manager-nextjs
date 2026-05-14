import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateCityForm from "@/features/OrderForm/components/CityForm/create-city-form";

const submitFormMock = vi.hoisted(() => vi.fn());
vi.mock("@/features/OrderForm/hooks/useFormSubmit", () => ({
	default: () => ({ submitForm: submitFormMock }),
}));

const onDialogClose = vi.fn();

beforeEach(() => {
	vi.clearAllMocks();
});

const setup = () => {
	const user = userEvent.setup();
	render(
		<CreateCityForm
			countries={[{ id: 1, code: "PL", name: "Poland" }]}
			onDialogClose={onDialogClose}
		/>,
	);

	return { user };
};

describe("CreateCityForm", () => {
	describe("render", () => {
		it("render form with inputs and buttons", async () => {
			setup();

			screen.getByLabelText("Nazwa miejscowości");
			screen.getByLabelText("Kod pocztowy");
			screen.getByRole("combobox");
			screen.getByRole("button", { name: "Dodaj" });
		});
	});
	describe("submit", () => {
		it("call submitForm when button is clicked", async () => {
			const { user } = setup();

			await user.click(screen.getByRole("combobox"));
			const option = await screen.findByRole("option", { name: "PL Poland" });
			await user.click(option);

			await user.type(screen.getByLabelText("Nazwa miejscowości"), "Kraków");
			await user.type(screen.getByLabelText("Kod pocztowy"), "30-001");

			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).toHaveBeenCalledTimes(1);
		});
	});

	it("not call submitForm when no or uncorrect data are provided", async () => {
		const { user } = setup();
		await user.click(screen.getByRole("button", { name: "Dodaj" }));

		expect(submitFormMock).not.toHaveBeenCalled();
	});
});
