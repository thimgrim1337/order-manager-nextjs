import { ReactNode } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useFieldContext } from "../../context/form-context";
import FormBase, { FormControlProps } from "./form-base";

type SelectData = {
	label: string;
	value: number;
	icon?: ReactNode;
};

export type SelectFieldProps = {
	data: SelectData[];
	placeholder: string;
	children?: ReactNode;
};

export default function SelectField({
	children,
	...props
}: FormControlProps & SelectFieldProps) {
	const field = useFieldContext<number>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const selectedValue = field.state.value;

	const selectedItem =
		props.data.filter((item) => item.value === selectedValue)[0] || null;

	return (
		<FormBase {...props}>
			<Select
				name={field.name}
				items={props.data}
				itemToStringLabel={(item: SelectData) => item.label}
				itemToStringValue={(item: SelectData) => String(item.value)}
				onValueChange={(item) => field.handleChange(item ? item.value : 0)}
				value={selectedItem && selectedItem}
			>
				<SelectTrigger
					className="w-45"
					aria-invalid={isInvalid}
					id={field.name}
				>
					<SelectValue placeholder={props.placeholder} />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{props.placeholder}</SelectLabel>
						{props.data.map((item) => (
							<SelectItem key={item.value} value={item}>
								{item.icon}
								{item.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			{children}
		</FormBase>
	);
}
