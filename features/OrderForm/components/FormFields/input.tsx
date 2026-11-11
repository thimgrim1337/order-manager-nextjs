import type { InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

export default function FormInput({
  label,
  icon,
  error,
  ...inputProps
}: FormControlProps & InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string>();

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Input
          {...inputProps}
          id={id}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
        />
      )}
    </FormBase>
  );
}
