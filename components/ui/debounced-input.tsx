import { InputHTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { Input } from './input';

type DebouncedInputProps = {
  value: string;
  onFiltersChange: (value: string) => void;
  debounce?: number;
  icon?: ReactNode;
};

export default function DebouncedInput({
  value: initialValue,
  onFiltersChange,
  debounce = 500,
  icon,
  ...props
}: DebouncedInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFiltersChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <>
      {icon}
      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </>
  );
}
