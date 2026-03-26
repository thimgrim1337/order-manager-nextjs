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

describe("CreateCityForm", () => {
	const user = userEvent.setup();

	describe("render", () => {
		it("render form with inputs and buttons", async () => {
			render(
				<CreateCityForm
					countries={[{ id: 1, code: "PL", name: "Poland" }]}
					onDialogClose={onDialogClose}
				/>,
			);

			screen.getByLabelText("Nazwa miejscowości");
			screen.getByLabelText("Kod pocztowy");
			screen.getByRole("combobox");
			screen.getByRole("button", { name: "Dodaj" });
		});
	});
	describe("submit", () => {
		it("call submitForm when button is clicked", async () => {
			render(
				<CreateCityForm
					countries={[{ id: 1, code: "PL", name: "Poland" }]}
					onDialogClose={onDialogClose}
				/>,
			);

			await user.click(screen.getByRole("combobox"));
			await user.click(screen.getByRole("option", { name: "PL Poland" }));

			await user.type(screen.getByLabelText("Nazwa miejscowości"), "Kraków");
			await user.type(screen.getByLabelText("Kod pocztowy"), "30-001");

			await user.click(screen.getByRole("button", { name: "Dodaj" }));

			expect(submitFormMock).toHaveBeenCalledTimes(1);
		});
	});

	it("not call submitForm when no or uncorrect data are provided", async () => {
		render(
			<CreateCityForm
				countries={[{ id: 1, code: "PL", name: "Poland" }]}
				onDialogClose={onDialogClose}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Dodaj" }));

		expect(submitFormMock).not.toHaveBeenCalled();
	});
});
