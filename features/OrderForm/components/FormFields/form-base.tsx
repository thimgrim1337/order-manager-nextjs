import type { ReactNode } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useFieldContext } from '../../context/form-context';

export type FormControlProps = {
  label: string;
  icon?: ReactNode;
  /** An error from outside the field's validators, shown as one of its own. */
  error?: string | null;
};

/** What the frame hands its field's control: the id its label points at, and whether it is invalid. */
type FormControl = {
  id: string;
  isInvalid: boolean;
};

type FormBaseProps = {
  children: (control: FormControl) => ReactNode;
  horizontal?: boolean;
};

/** A field's frame: its label, its errors, and the one rule for when the field is invalid. */
export default function FormBase({
  label,
  children,
  horizontal,
  icon,
  error,
}: FormControlProps & FormBaseProps) {
  const field = useFieldContext();
  const id = field.name;
  const isInvalid = (field.state.meta.isTouched && !field.state.meta.isValid) || !!error;
  return (
    <Field orientation={horizontal ? 'horizontal' : undefined} className="min-w-0 flex-1">
      <FieldLabel htmlFor={id}>
        {icon}
        {label}
      </FieldLabel>

      {children({ id, isInvalid })}
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
