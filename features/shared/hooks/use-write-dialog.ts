import { useState, useTransition } from 'react';
import type { ActionResponse } from '@/lib/action-response';
import { type SettleWriteOptions, settleWrite } from '../lib/settle-write';

/**
 * A dialog that makes a write: whether it is open, and whether its write still runs, held together
 * by whoever renders the dialog, so they outlive its content, which unmounts on close. A dialog
 * closed and reopened mid-write still shows it running, and the write's success closes the dialog
 * whenever it was opened.
 */
export type WriteDialog = {
  isOpen: boolean;
  open: () => void;
  onOpenChange: (open: boolean) => void;
  /** Whether the dialog's write still runs, so it can disable its write buttons. */
  isWriting: boolean;
  /**
   * Runs the write through `settleWrite`, closing this dialog once it succeeded; settles once the
   * write did.
   */
  write: <T>(
    action: () => Promise<ActionResponse<T>>,
    options: Omit<SettleWriteOptions<T>, 'closeDialog'>,
  ) => Promise<void>;
};

/** What a form in a write dialog saves through: its write, and whether one runs from an earlier opening. */
export type FormWrite = Pick<WriteDialog, 'write' | 'isWriting'>;

/**
 * Each dialog keeps its own open state, so a late close from one of a row's dialogs closes only
 * that one, never another opened since.
 */
export function useWriteDialog(): WriteDialog {
  const [isOpen, setIsOpen] = useState(false);
  const [isWriting, startTransition] = useTransition();

  return {
    isOpen,
    open: () => setIsOpen(true),
    onOpenChange: setIsOpen,
    isWriting,
    write: (action, options) =>
      new Promise((resolve) =>
        startTransition(async () => {
          await settleWrite(action, { ...options, closeDialog: () => setIsOpen(false) });
          resolve();
        }),
      ),
  };
}
