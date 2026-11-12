import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/form-context';
import { useEditLock } from '../../hooks/use-edit-lock';

/**
 * The form's element and its controls, rendering its edit lock (`useEditLock`): it saves only
 * through its own submit, whether the user clicks Zapisz or presses Enter in a field.
 */
export default function SaveForm({
  children,
  isBlocked = false,
  isSaving = false,
  startsLocked = false,
}: {
  children: ReactNode;
  /** Keeps a valid form from saving, for what its fields don't validate. */
  isBlocked?: boolean;
  /**
   * Whether a save runs that outlives the form, as a dialog's write does when it closes and
   * reopens mid-save: the form opens saving, and saves nothing more until it settles.
   */
  isSaving?: boolean;
  /**
   * Opens with its fields locked until the user asks to edit them: Edytuj shows in place of Zapisz
   * and unlocks them, and Reset locks them again.
   */
  startsLocked?: boolean;
}) {
  const form = useFormContext();
  const lock = useEditLock({
    startsLocked,
    isSaving,
    submit: () => form.handleSubmit(),
    restore: () => form.reset(),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // A dialog's form opened from this one sits inside it in React's tree, so its submit bubbles here.
        e.stopPropagation();
        // Enter submits only through an enabled Zapisz, so `isBlocked` and the lock hold here too.
        lock.save();
      }}
    >
      <fieldset disabled={lock.state === 'locked'}>{children}</fieldset>
      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <div className="mt-5 flex gap-2">
            {lock.state === 'locked' ? (
              // Keyed apart from Zapisz: one button turned submit by its own click would submit the form.
              <Button key="edit" type="button" onClick={lock.edit}>
                Edytuj
              </Button>
            ) : (
              <Button
                key="save"
                type="submit"
                disabled={!canSubmit || isBlocked || lock.state === 'saving'}
              >
                {lock.state === 'saving' ? 'Wysyłanie' : 'Zapisz'}
              </Button>
            )}
            <Button
              type="reset"
              variant={'secondary'}
              onClick={(e) => {
                e.preventDefault();
                lock.reset();
              }}
            >
              Reset
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
