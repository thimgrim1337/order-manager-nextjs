import { FieldGroup } from "@/components/ui/field";
import { createCity } from "@/lib/actions";
import { createCitySchema } from "@/lib/dto/city.dto";
import { Country } from "@/types/types";
import { useAppForm } from "../../hooks/useAppForm";
import useFormSubmit from "../../hooks/useFormSubmit";
import "country-flag-icons/3x2/flags.css";

export default function CreateCityForm({
	countries,
	onDialogClose,
}: {
	countries: Country[];
	onDialogClose: () => void;
}) {
	const { submitForm } = useFormSubmit({ action: createCity, onDialogClose });

	const form = useAppForm({
		defaultValues: {
			name: "",
			postal: "",
			countryId: 0,
		},
		validators: {
			onChange: createCitySchema,
		},
		onSubmit: async ({ value }) =>
			submitForm(value, {
				errorTitle: "Nie udało się utworzyć miejscowości.",
				successTitle: "Pomyślnie utworzono miejsowość",
				successDescription: `Pomyślnie utworzono nową miejscowość: ${value.name}`,
			}),
	});

	return (
		<form
			id="create-city-form"
			data-testid="create-city-form"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.AppForm>
				<FieldGroup>
					<form.AppField name="countryId">
						{(field) => (
							<field.SelectField
								label="Kod kraju"
								placeholder="Wybierz kraj"
								data={countries?.map((country) => ({
									id: country.id,
									value: `${country.code} ${country.name}`,
									icon: <span className={`flag:${country.code}`}></span>,
								}))}
							/>
						)}
					</form.AppField>
					<form.AppField name="postal">
						{(field) => <field.InputField label="Kod pocztowy" />}
					</form.AppField>
					<form.AppField name="name">
						{(field) => <field.InputField label="Nazwa miejscowości" />}
					</form.AppField>
				</FieldGroup>
				<form.FormControls id={form.formId} />
			</form.AppForm>
		</form>
	);
}
