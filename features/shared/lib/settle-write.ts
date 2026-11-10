import { toast } from 'sonner';
import type { ActionResponse, Refusal } from '@/lib/action-response';

/** Next redacts a Server Action's thrown error in production, so its text means nothing to the user. */
const UNEXPECTED_ERROR = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';

export type SettleWriteOptions = {
  /** Closes the dialog that made the write. */
  closeDialog: () => void;
  errorTitle?: string;
  successDescription: string;
  /**
   * Shows a refused write's reason on the field it concerns, and returns whether it did; a refusal
   * no field shows gets the toast.
   */
  showOnField?: (refusal: Refusal) => boolean;
};

/**
 * Runs a dialog's write Server Action and settles its outcome: a toast for every outcome a field
 * doesn't show, and closes the dialog only once it succeeded, so a failed write leaves its dialog
 * open to retry.
 *
 * Refreshes nothing: the action's `updateTag` already sends the page's fresh data back with its
 * response.
 */
export async function settleWrite<T>(
  action: () => Promise<ActionResponse<T>>,
  {
    closeDialog,
    errorTitle = 'Niepowodzenie',
    successDescription,
    showOnField,
  }: SettleWriteOptions,
): Promise<void> {
  try {
    const response = await action();

    if (!response.success) {
      if (showOnField?.(response)) return;
      toast.error(errorTitle, { description: response.message, richColors: true });
      return;
    }

    toast.success('Sukces', { description: successDescription, richColors: true });
    closeDialog();
  } catch (error) {
    console.error(error);
    toast.error(errorTitle, { description: UNEXPECTED_ERROR, richColors: true });
  }
}
