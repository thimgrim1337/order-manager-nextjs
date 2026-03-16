import {
	createFormHook,
	FieldApi,
	FormOptions,
} from "@tanstack/react-form-nextjs";
import ComboboxField from "../components/FormFields/combobox";
import FormControls from "../components/FormFields/controls";
import DateField from "../components/FormFields/date-field";
import InputField from "../components/FormFields/input";
import PlaceField from "../components/FormFields/place-field";
import SelectField from "../components/FormFields/select-field";
import { fieldContext, formContext } from "../context/form-context";

export const { useAppForm, withForm } = createFormHook({
	fieldComponents: {
		InputField,
		DateField,
		PlaceField,
		SelectField,
		ComboboxField,
	},
	formComponents: {
		FormControls,
	},
	fieldContext,
	formContext,
});
