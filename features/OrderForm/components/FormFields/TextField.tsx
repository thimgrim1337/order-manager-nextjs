import { HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { useFieldContext } from '../../context/form-context';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function TextField({
  label,
  Icon,
  ...props
}: {
  label: string;
  Icon?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  const field = useFieldContext<string | number>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field aria-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {Icon}
        {label}
      </FieldLabel>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(
            props.type === 'number' ? +e.target.value : e.target.value
          )
        }
        aria-invalid={isInvalid}
        {...props}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
