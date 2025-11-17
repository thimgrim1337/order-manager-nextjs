import { InputHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { Input } from '../ui/input';

type DebouncedInputProps = {
  value: string;
  onChange: (value: string | number) => void;
  debounce?: number;
  children?: ReactNode;
};

export default function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 200,
  children,
  ...props
}: DebouncedInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState<string | number>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <>
      <Input
        {...props}
        value={value ?? ''}
        onChange={(e) => {
          if (e.target.value === '') return setValue('');
          if (props.type === 'number') {
            setValue(e.target.valueAsNumber);
          } else {
            setValue(e.target.value);
          }
        }}
      />
      {children}
    </>
  );
}
