import { useFieldContext } from '../../context/form-context';
import { Combobox } from '@/components/ui/combobox';
import FormBase, { FormControlProps } from './form-base';
import { ComboboxFieldData } from '@/types/types';

type ComboboxFieldProps = {
  data: ComboboxFieldData[];
  placeholder: string;
  onSearch?: (value: string) => void;
};

export default function ComboboxField(
  props: FormControlProps & ComboboxFieldProps,
) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const selectedValue = field.state.value;

  return (
    <FormBase {...props}>
      <Combobox
        data={props.data}
        onChange={field.handleChange}
        placeholder={props.placeholder}
        value={selectedValue}
        onSearch={props.onSearch}
        aria-invalid={isInvalid}
      />
    </FormBase>
  );
}
