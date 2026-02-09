import { Input } from '@/components/ui/input';
import FormBase, { FormControlProps } from './form-base';
import { useFieldContext } from '../../context/form-context';
import { InputHTMLAttributes } from 'react';

export default function FormInput(
  props: FormControlProps & InputHTMLAttributes<HTMLInputElement>,
) {
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <FormBase {...props}>
      <Input
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
    </FormBase>
  );
}
