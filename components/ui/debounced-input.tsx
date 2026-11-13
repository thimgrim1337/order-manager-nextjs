import { InputHTMLAttributes, ReactNode, useEffect, useEffectEvent, useState } from 'react';
import { Input } from './input';

type DebouncedInputProps = {
  /** The value the parent holds, e.g. the URL's; it comes back changed after `onDebouncedChange`. */
  value: string;
  onDebouncedChange: (value: string) => void;
  /** How the parent stores a typed value (e.g. trimmed), so its echo is recognised as one. */
  normalize?: (value: string) => string;
  debounce?: number;
  icon?: ReactNode;
};

/**
 * An input handing its value to `onDebouncedChange` once typing pauses. A new `value` replaces
 * the typed one, unless it echoes one this input handed out: typing that went on meanwhile is
 * kept, and goes out as its own change.
 */
export default function DebouncedInput({
  value: committed,
  onDebouncedChange,
  normalize = (value) => value,
  debounce = 500,
  icon,
  ...props
}: DebouncedInputProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState<string>(committed);
  const [seenCommitted, setSeenCommitted] = useState(committed);
  // Normalised values handed to onDebouncedChange whose echo hasn't come back yet.
  const [inFlight, setInFlight] = useState<string[]>([]);

  if (committed !== seenCommitted) {
    setSeenCommitted(committed);
    const echoed = inFlight.indexOf(committed);
    if (echoed === -1) {
      setValue(committed);
      setInFlight([]);
    } else {
      setInFlight(inFlight.slice(echoed + 1));
    }
  }

  const emit = useEffectEvent(() => {
    const sent = normalize(value);
    if (sent === (inFlight.at(-1) ?? committed)) return;
    setInFlight((pending) => [...pending, sent]);
    onDebouncedChange(value);
  });

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
