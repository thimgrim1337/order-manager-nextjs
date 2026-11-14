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

type SinglePickComboboxFieldProps<T> = FormControlProps & {
  /** The items offered to pick from. */
  choices: T[];
  /** How an item reads, on the field and in the list. */
  itemLabel: (item: T) => string;
  placeholder: string;
  /** Called with the text typed into the field, e.g. to search the choices. */
  onSearchTextChange?: (text: string) => void;
  /**
   * Whether an item matches the text typed into the field. Left out, Base UI matches its label with
   * `contains` (`@base-ui/react` 1.4.1, `esm/combobox/root/AriaCombobox.js:148-159`).
   */
  filter?: (item: T, text: string) => boolean;
};

/**
 * Picks one item, holding the picked item itself and labelling the field from it, so the field
 * shows it whatever the choices are.
 */
export default function SinglePickComboboxField<T extends { id: number }>({
  choices,
  itemLabel,
  placeholder,
  onSearchTextChange,
  filter,
  label,
  icon,
  error,
}: SinglePickComboboxFieldProps<T>) {
  const field = useFieldContext<T | null>();

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Combobox
          items={choices}
          itemToStringLabel={itemLabel}
          itemToStringValue={(item: T) => String(item.id)}
          filter={filter}
          onInputValueChange={onSearchTextChange}
          onValueChange={(item: T | null) => field.handleChange(item)}
          isItemEqualToValue={(item, value) => item.id === value.id}
          value={field.state.value}
        >
          <ComboboxInput placeholder={placeholder} aria-invalid={isInvalid} id={id} />
          <ComboboxContent>
            <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
            <ComboboxList>
              {(item: T) => (
                <ComboboxItem key={item.id} value={item}>
                  {itemLabel(item)}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </FormBase>
  );
}
