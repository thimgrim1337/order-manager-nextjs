import { InputHTMLAttributes, ReactNode, useEffect, useEffectEvent, useState } from 'react';
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

  const emit = useEffectEvent(() => onFiltersChange(value));

  useEffect(() => {
    const timeout = setTimeout(emit, debounce);

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
