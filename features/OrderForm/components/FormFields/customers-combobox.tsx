import useSearchQuery from "@/features/shared/hooks/useSearchQuery";
import { searchCustomers } from "@/lib/actions";
import { Customer } from "@/types/types";
import ComboboxField from "./combobox";

export default function CustomersComboboxField({
	customers: initialData,
}: {
	customers: Customer[];
}) {
	const { data: customers, setQuery } = useSearchQuery(
		searchCustomers,
		initialData,
	);

	return (
		<ComboboxField
			data={customers?.map((customer) => ({
				id: customer.id,
				value: customer.name,
			}))}
			label="Zleceniodawca"
			placeholder="Wybierz zleceniodawcę"
			comboboxWidth="w-103"
			onSearch={(value) => setQuery(value)}
		/>
	);
}
