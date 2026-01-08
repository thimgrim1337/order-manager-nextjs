import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useFieldContext } from '../../context/form-context';
import { ReactNode } from 'react';
import { Combobox } from '@/components/ui/combobox';
import { ComboboxData } from '@/types/types';

export default function ComboboxField({
  data,
  onSearch,
  label,
  placeholder,
  Icon,
}: {
  data: ComboboxData[];
  onSearch?: (value: string) => void;
  label: string;
  placeholder: string;
  Icon?: ReactNode;
}) {
  const field = useFieldContext<number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const selectedValue = field.state.value;

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>
        {Icon}
        {label}
      </FieldLabel>
      <Combobox
        data={data}
        onChange={field.handleChange}
        placeholder={placeholder}
        value={selectedValue}
        onSearch={onSearch}
        aria-invalid={isInvalid}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
