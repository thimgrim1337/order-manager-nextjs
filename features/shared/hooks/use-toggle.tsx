import { type Dispatch, type SetStateAction, useState } from 'react';

type ToggleActions = {
  setTrue: () => void;
  setFalse: () => void;
  setValue: Dispatch<SetStateAction<boolean>>;
};

export default function useToggle(initialValue = false): [boolean, ToggleActions] {
  const [value, setValue] = useState(initialValue);

  const setTrue = () => setValue(true);
  const setFalse = () => setValue(false);

  return [value, { setTrue, setFalse, setValue }];
}
