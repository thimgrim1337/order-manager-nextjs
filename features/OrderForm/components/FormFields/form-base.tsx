import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useFieldContext } from '../../context/form-context';

export type FormControlProps = {
  label: string;
  icon?: ReactNode;
  /** An error from outside the field's validators, shown as one of its own. */
  error?: string | null;
};

type FormBaseProps = {
  children: ReactNode;
  horizontal?: boolean;
};

export default function FormBase({
  label,
  children,
  horizontal,
  icon,
  error,
}: FormControlProps & FormBaseProps) {
  const field = useFieldContext();
  const isInvalid = (field.state.meta.isTouched && !field.state.meta.isValid) || !!error;
  return (
    <Field
      aria-invalid={isInvalid}
      orientation={horizontal ? 'horizontal' : undefined}
      className="min-w-0 flex-1"
    >
      <FieldLabel htmlFor={field.name}>
        {icon}
        {label}
      </FieldLabel>

      {children}
      {isInvalid && (
        <FieldError
          errors={
            error ? [...field.state.meta.errors, { message: error }] : field.state.meta.errors
          }
        />
      )}
    </Field>
  );
}
1;
