import type { FormWrite } from '@/features/shared/hooks/use-write-dialog';
import { settleWrite } from '@/features/shared/lib/settle-write';

/**
 * A dialog whose write starts with the form, as `useWriteDialog`'s does when it opens idle,
 * calling `closeDialog` once the write succeeded.
 */
export function idleWriteDialog(closeDialog: () => void): FormWrite {
  return {
    isWriting: false,
    write: (action, options) => settleWrite(action, { ...options, closeDialog }),
  };
}
