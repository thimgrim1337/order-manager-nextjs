import { searchCustomers } from '@/lib/actions';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { useFieldContext } from '../../context/form-context';
import useSearchedChoices from '../../hooks/use-searched-choices';
import type { FormControlProps } from './form-base';
import SinglePickComboboxField from './single-pick-combobox';

type CustomerComboboxFieldProps = FormControlProps & {
  customers: CustomerReadModel[];
};

/** Picks the Order's Customer, holding the picked one whatever the Customer search returns. */
export default function CustomersComboboxField({
  customers: initialData,
  ...controlProps
}: CustomerComboboxFieldProps) {
  const picked = useFieldContext<CustomerReadModel | null>().state.value;
  const { choices, setSearchText } = useSearchedChoices({
    search: searchCustomers,
    startingChoices: initialData,
    picked: picked ? [picked] : [],
  });

  return (
    <SinglePickComboboxField
      {...controlProps}
      choices={choices}
      itemLabel={(customer) => customer.name}
      placeholder="Wybierz zleceniodawcę"
      onSearchTextChange={setSearchText}
    />
  );
}
