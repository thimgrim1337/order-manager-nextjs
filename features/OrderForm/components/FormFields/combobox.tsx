import { Combobox } from "@/components/ui/combobox";
import { FieldData } from "@/types/types";
import { useFieldContext } from "../../context/form-context";
import FormBase, { FormControlProps } from "./form-base";

type ComboboxFieldProps = {
	data: FieldData[];
	placeholder: string;
	onSearch?: (value: string) => void;
};

export default function ComboboxField(
	props: FormControlProps & ComboboxFieldProps,
) {
	const field = useFieldContext<number | string>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

	const selectedValue = field.state.value;

	return (
		<FormBase {...props}>
			<Combobox
				data={props.data}
				onChange={field.handleChange}
				placeholder={props.placeholder}
				value={selectedValue}
				onSearch={props.onSearch}
				aria-invalid={isInvalid}
			/>
		</FormBase>
	);
}
