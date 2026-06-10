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

export type SelectData = {
	label: string;
	value: number;
	icon?: ReactNode;
};

export type SelectFieldProps = FormControlProps & {
	data: SelectData[];
	placeholder: string;
	showRecentList?: boolean;
	onTrackValue?: (value: number) => void;
	recentData?: SelectData[];
	children?: ReactNode;
};

export default function SelectField({ children, ...props }: SelectFieldProps) {
	const field = useFieldContext<number>();

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	const selectedValue = field.state.value;
	const selectedItem =
		props.data.filter((item) => item.value === selectedValue)[0] || null;

	const isShowRecentList =
		props.showRecentList && props.recentData && props.recentData.length > 0;

	const restValues = isShowRecentList
		? props.data.filter(
				(d) => !props.recentData?.find((o) => o.value === d.value),
			)
		: props.data;

	return (
		<FormBase {...props}>
			<Select
				name={field.name}
				items={props.data}
				itemToStringLabel={(item: SelectData) => item.label}
				itemToStringValue={(item: SelectData) => String(item.value)}
				onValueChange={(item) => {
					field.handleChange(item ? item.value : 0);
					item && props.onTrackValue && props.onTrackValue(item.value);
				}}
				value={selectedItem && selectedItem}
			>
				<SelectTrigger
					className="w-45"
					aria-invalid={isInvalid}
					id={field.name}
				>
					<SelectValue placeholder={props.placeholder}>
						{(data: SelectData) => (
							<span className="flex gap-2 items-center">
								{data?.icon} {data?.label}
							</span>
						)}
					</SelectValue>
				</SelectTrigger>
				<SelectContent alignItemWithTrigger={false}>
					{isShowRecentList && (
						<SelectGroup>
							<SelectLabel>Ostatnio wybierane</SelectLabel>
							{props.recentData?.map((item) => (
								<SelectItem key={item.value} value={item}>
									{item.icon}
									{item.label}
								</SelectItem>
							))}
						</SelectGroup>
					)}
					<SelectGroup>
						<SelectLabel>{props.placeholder}</SelectLabel>
						{restValues.map((item) => (
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
