import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

type ComboboxData = {
  label: string;
  value: number;
};

type ComboboxFieldProps = {
  data: ComboboxData[];
  placeholder: string;
  onSearch?: (value: string) => void;
};

export default function ComboboxField({
  label,
  icon,
  error,
  data,
  placeholder,
  onSearch,
}: FormControlProps & ComboboxFieldProps) {
  const field = useFieldContext<number>();
  const selectedValue = field.state.value;

  const selectedItem = data.find((item) => item.value === selectedValue) ?? null;

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Combobox
          items={data}
          itemToStringLabel={(item: ComboboxData) => item.label}
          onInputValueChange={onSearch}
          onValueChange={(item) => field.handleChange(item ? item.value : 0)}
          value={selectedItem}
        >
          <ComboboxInput placeholder={placeholder} aria-invalid={isInvalid} id={id} />
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
      )}
    </FormBase>
  );
}
