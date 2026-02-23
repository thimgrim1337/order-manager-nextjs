import { useFieldContext } from '../../context/form-context';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import FormBase, { FormControlProps } from './form-base';
import { ReactNode } from 'react';
import { FieldData } from '@/types/types';

export type SelectFieldProps = {
  data: FieldData[];
  placeholder: string;
  children?: ReactNode;
};

export default function SelectField({
  data,
  placeholder,
  children,
  ...props
}: FormControlProps & SelectFieldProps) {
  const field = useFieldContext<number | string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const value = String(field.state.value);

  return (
    <FormBase {...props}>
      <Select
        onValueChange={(value) => field.handleChange(Number(value) || value)}
        name={field.name}
        value={value === '0' ? '' : value}
      >
        <SelectTrigger className='w-45' aria-invalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{placeholder}</SelectLabel>
            {data.map((d) => (
              <SelectItem value={String(d.id || d.value)} key={d.id || d.value}>
                {d?.icon && d.icon}
                {d.value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {children}
    </FormBase>
  );
}
