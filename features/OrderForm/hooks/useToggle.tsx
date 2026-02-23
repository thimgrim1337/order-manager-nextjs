import { Dispatch, SetStateAction, useState } from 'react';

type ToggleActions = {
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
  setValue: SetStateAction<Dispatch<boolean>>;
};

export default function useToggle(
  initialValue = false,
): [boolean, ToggleActions] {
  const [value, setValue] = useState(initialValue);

  const toggle = () => setValue((value) => !value);
  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return [value, { toggle, setTrue, setFalse, setValue }];
}
