import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import useSearchQuery from '@/features/shared/hooks/use-search-query';
import { searchCustomers } from '@/lib/actions';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { useFieldContext } from '../../context/form-context';
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
  const { data: customers, setQuery } = useSearchQuery(searchCustomers, initialData);

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Combobox
          items={customers}
          itemToStringLabel={(item: CustomerReadModel) => item.name}
          itemToStringValue={(item: CustomerReadModel) => String(item.id)}
          onInputValueChange={setQuery}
          onValueChange={(item: CustomerReadModel | null) => field.handleChange(item)}
          isItemEqualToValue={(item, value) => item.id === value.id}
          value={field.state.value}
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
