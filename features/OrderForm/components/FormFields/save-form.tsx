import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useFormContext } from '../../context/form-context';

/**
 * The form's element and its controls: it saves only through its own submit, whether the user
 * clicks Zapisz or presses Enter in a field.
 */
export default function SaveForm({
  children,
  isBlocked = false,
  lock,
}: {
  children: ReactNode;
  /** Keeps a valid form from saving, for what its fields don't validate. */
  isBlocked?: boolean;
  /**
   * Fields locked until the user asks to edit them: Edytuj shows in place of Zapisz and unlocks
   * them, and Reset locks them again.
   */
  lock?: { isLocked: boolean; setIsLocked: (isLocked: boolean) => void };
}) {
  const form = useFormContext();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // A dialog's form opened from this one sits inside it in React's tree, so its submit bubbles here.
        e.stopPropagation();
        // Enter submits only through an enabled Zapisz, so `isBlocked` and the lock hold here too.
        form.handleSubmit();
      }}
    >
      {children}
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <div className="mt-5 flex gap-2">
            {lock?.isLocked ? (
              // Keyed apart from Zapisz: one button turned submit by its own click would submit the form.
              <Button key="edit" type="button" onClick={() => lock.setIsLocked(false)}>
                Edytuj
              </Button>
            ) : (
              <Button key="save" type="submit" disabled={!canSubmit || isBlocked}>
                {isSubmitting ? 'Wysyłanie' : 'Zapisz'}
              </Button>
            )}
            <Button
              type="reset"
              variant={'secondary'}
              onClick={(e) => {
                e.preventDefault();
                lock?.setIsLocked(true);
                form.reset();
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
