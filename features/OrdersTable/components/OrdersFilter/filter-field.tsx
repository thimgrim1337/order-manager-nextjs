import type { ReactNode } from 'react';
import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';

type FilterFieldProps = {
  label: string;
  children: ReactNode;
};

export default function FilterField({ label, children }: FilterFieldProps) {
  return (
    <Field>
      <Label>{label}</Label>
      {children}
    </Field>
  );
}
