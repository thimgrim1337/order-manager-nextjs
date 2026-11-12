import { useState } from 'react';

/**
 * Where a form stands with its user: `locked` shows its values with its fields disabled until the
 * user asks to edit them, `editing` takes changes, and `saving` waits on its submit.
 */
type EditLockState = 'locked' | 'editing' | 'saving';

type EditLock = {
  state: EditLockState;
  /** Unlocks a locked form. */
  edit: () => void;
  /** Saves an editing form, and keeps it editing, with what the user entered, if the save is refused. */
  save: () => Promise<void>;
  /** Restores the values the form opened with, and the state it opened in. */
  reset: () => void;
};

/**
 * A form's edit lock: it opens `locked` when `startsLocked` (an existing Order), `editing`
 * otherwise. `submit` and `restore` are the form's own, so the lock knows nothing of its values.
 */
export function useEditLock({
  startsLocked,
  submit,
  restore,
}: {
  startsLocked: boolean;
  submit: () => Promise<void>;
  restore: () => void;
}): EditLock {
  const startingState = startsLocked ? 'locked' : 'editing';
  const [state, setState] = useState<EditLockState>(startingState);

  return {
    state,
    edit: () => setState((current) => (current === 'locked' ? 'editing' : current)),
    save: async () => {
      if (state !== 'editing') return;
      setState('saving');
      try {
        await submit();
      } finally {
        // Editing again whatever the outcome, unless a Reset mid-save locked it.
        setState((current) => (current === 'saving' ? 'editing' : current));
      }
    },
    reset: () => {
      restore();
      setState(startingState);
    },
  };
}
