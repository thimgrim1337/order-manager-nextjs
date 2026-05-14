import { createFormHook } from "@tanstack/react-form-nextjs";
import ComboboxField from "../components/FormFields/combobox";
import FormControls from "../components/FormFields/controls";
import CustomersComboboxField from "../components/FormFields/customers-combobox";
import DateField from "../components/FormFields/date-field";
import InputField from "../components/FormFields/input";
import PlacesComboboxField from "../components/FormFields/places-combobox";
import SelectField from "../components/FormFields/select-field";
import { fieldContext, formContext } from "../context/form-context";

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		DateField,
		SelectField,
		ComboboxField,
		CustomersComboboxField,
		PlacesComboboxField,
	},
	formComponents: {
		FormControls,
	},
	fieldContext,
	formContext,
});
