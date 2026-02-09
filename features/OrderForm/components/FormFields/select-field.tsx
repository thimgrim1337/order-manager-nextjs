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

export type SelectFieldProps = {
  data: string[];
  placeholder: string;
  children?: ReactNode;
};

export default function SelectField({
  data,
  placeholder,
  children,
  ...props
}: FormControlProps & SelectFieldProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Select
        onValueChange={field.handleChange}
        name={field.name}
        value={field.state.value}
      >
        <SelectTrigger className='w-45' aria-invalid={isInvalid}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{placeholder}</SelectLabel>
            {data.map((d) => (
              <SelectItem value={d} key={d}>
                {d}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {children}
    </FormBase>
  );
}
