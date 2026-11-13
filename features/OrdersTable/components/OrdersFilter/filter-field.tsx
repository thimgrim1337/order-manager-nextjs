import { type ReactNode, useId } from 'react';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';

type FilterFieldProps = {
  label: string;
  /** The filter's control, given the id its label points at. */
  children: (id: string) => ReactNode;
};

export default function FilterField({ label, children }: FilterFieldProps) {
  const id = useId();

  return (
    <Field>
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
    </Field>
  );
}
