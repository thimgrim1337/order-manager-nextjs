import { toast } from 'sonner';
import type { ActionResponse } from '@/lib/action-response';

/** Next redacts a Server Action's thrown error in production, so its text means nothing to the user. */
const UNEXPECTED_ERROR = 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.';

export type OutcomeToast = {
  errorTitle?: string;
  successTitle?: string;
  successDescription?: string;
};

/**
 * Runs a Server Action and toasts its outcome: the failure's message, a fixed message when it
 * throws, and a success toast only when given success text. Returns whether it succeeded.
 */
export async function toastOutcome<T>(
  action: () => Promise<ActionResponse<T>>,
  { errorTitle = 'Niepowodzenie', successTitle, successDescription }: OutcomeToast = {},
): Promise<boolean> {
  try {
    const response = await action();

    if (!response.success) {
      toast.error(errorTitle, { description: response.message, richColors: true });
      return false;
    }

    if (successTitle || successDescription)
      toast.success(successTitle ?? 'Sukces', {
        description: successDescription,
        richColors: true,
      });

    return true;
  } catch (error) {
    console.error(error);
    toast.error(errorTitle, { description: UNEXPECTED_ERROR, richColors: true });
    return false;
  }
}
