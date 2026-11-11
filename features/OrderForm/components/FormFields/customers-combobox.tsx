import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { searchCustomers } from '@/lib/actions';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { useFieldContext } from '../../context/form-context';
import useSearchedChoices from '../../hooks/use-searched-choices';
import FormBase, { type FormControlProps } from './form-base';

type CustomerComboboxFieldProps = FormControlProps & {
  customers: CustomerReadModel[];
};

/** Picks the Order's Customer, holding the picked one whatever the Customer search returns. */
export default function CustomersComboboxField({
  customers: initialData,
  label,
  icon,
  error,
}: CustomerComboboxFieldProps) {
  const field = useFieldContext<CustomerReadModel | null>();
  const picked = field.state.value;
  const { choices: customers, setSearchText } = useSearchedChoices({
    search: searchCustomers,
    startingChoices: initialData,
    picked: picked ? [picked] : [],
  });

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Combobox
          items={customers}
          itemToStringLabel={(item: CustomerReadModel) => item.name}
          itemToStringValue={(item: CustomerReadModel) => String(item.id)}
          onInputValueChange={setSearchText}
          onValueChange={(item: CustomerReadModel | null) => field.handleChange(item)}
          isItemEqualToValue={(item, value) => item.id === value.id}
          value={picked}
        >
          <ComboboxInput placeholder="Wybierz zleceniodawcę" aria-invalid={isInvalid} id={id} />
          <ComboboxContent>
            <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
            <ComboboxList>
              {(customer: CustomerReadModel) => (
                <ComboboxItem key={customer.id} value={customer}>
                  {customer.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FormBase>
  );
}
