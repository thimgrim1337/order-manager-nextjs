import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
} from "@/components/ui/combobox";
import { useFieldContext } from "../../context/form-context";
import FormBase, { FormControlProps } from "./form-base";

type ComboboxData = {
	label: string;
	value: number;
};

type ComboboxFieldProps = {
	data: ComboboxData[];
	placeholder: string;
	onSearch?: (value: string) => void;
};

export default function ComboboxField(
	props: FormControlProps & ComboboxFieldProps,
) {
	const field = useFieldContext<number>();
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const selectedValue = field.state.value;

	const selectedItem =
		props.data.filter((item) => item.value === selectedValue)[0] || null;

	return (
		<FormBase {...props}>
			<Combobox
				items={props.data}
				itemToStringLabel={(item: ComboboxData) => item.label}
				onInputValueChange={props.onSearch}
				onValueChange={(item) => field.handleChange(item ? item.value : 0)}
				value={selectedItem && selectedItem}
			>
				<ComboboxInput
					placeholder={props.placeholder}
					aria-invalid={isInvalid}
					id={field.name}
				/>
				<ComboboxContent>
					<ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
					<ComboboxList>
						{(item) => (
							<ComboboxItem key={item.value} value={item}>
								{item.label}
							</ComboboxItem>
						)}
					</ComboboxList>
				</ComboboxContent>
			</Combobox>
		</FormBase>
	);
}
