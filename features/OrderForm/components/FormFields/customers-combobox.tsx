import useSearchQuery from "@/features/shared/hooks/useSearchQuery";
import { searchCustomers } from "@/lib/actions";
import { Customer } from "@/types/types";
import ComboboxField from "./combobox";
import { FormControlProps } from "./form-base";

type CustomerComboboxFieldProps = FormControlProps & {
	customers: Customer[];
};

export default function CustomerComboboField({
	customers: initialData,
	...props
}: CustomerComboboxFieldProps) {
	const { data: customers, setQuery } = useSearchQuery(
		searchCustomers,
		initialData,
	);

	return (
		<ComboboxField
			{...props}
			data={customers.map((customer) => ({
				label: customer.name,
				value: customer.id,
			}))}
			placeholder="Wybierz zleceniodawcę"
			onSearch={setQuery}
		/>
	);
}
