import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { useFieldContext } from '../../context/form-context';
import { ReactNode } from 'react';

export type FormControlProps = {
  label: string;
  icon?: ReactNode;
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
}: FormControlProps & FormBaseProps) {
  const field = useFieldContext();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field
      aria-invalid={isInvalid}
      orientation={horizontal ? 'horizontal' : undefined}
    >
      <FieldLabel htmlFor={field.name}>
        {icon}
        {label}
      </FieldLabel>

      {children}
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
1;
