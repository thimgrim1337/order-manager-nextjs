import { useEffect, useState } from 'react';

export default function useDebouce(value: string, delay: number) {
  const [debouncedValue, setDeboucedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeboucedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
