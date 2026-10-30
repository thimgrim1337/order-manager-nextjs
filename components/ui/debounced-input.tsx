import { InputHTMLAttributes, ReactNode, useEffect, useEffectEvent, useState } from 'react';
import { Input } from './input';

type DebouncedInputProps = {
  value: string;
  onDebouncedChange: (value: string) => void;
  debounce?: number;
  icon?: ReactNode;
};

export default function DebouncedInput({
  value: initialValue,
  onDebouncedChange,
  debounce = 500,
  icon,
  ...props
}: DebouncedInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState<string>(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const emit = useEffectEvent(() => onDebouncedChange(value));

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
