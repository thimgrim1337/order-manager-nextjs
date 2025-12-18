import { ReactNode } from 'react';
import { useFieldContext } from '../../context/form-context';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SelectField({
  label,
  placeholder,
  Icon,
  children,
}: {
  label: string;
  placeholder: string;
  Icon?: ReactNode;
  children?: ReactNode;
}) {
  const field = useFieldContext<string | 'EUR' | 'PLN'>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const currencies = ['PLN', 'EUR'];

  return (
    <Field aria-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {Icon}
        {label}
      </FieldLabel>
      <Select
        onValueChange={field.handleChange}
        name={field.name}
        value={field.state.value}
      >
        <SelectTrigger className='w-[180px]' aria-invalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{placeholder}</SelectLabel>
            {currencies.map((currency) => (
              <SelectItem value={currency} key={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
      {children}
    </Field>
  );
}
