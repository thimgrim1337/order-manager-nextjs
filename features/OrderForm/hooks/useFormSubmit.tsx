import { useRouter } from 'next/navigation';
import { type OutcomeToast, toastOutcome } from '@/features/shared/lib/toast-outcome';
import type { ActionResponse } from '@/lib/action-response';

export default function useFormSubmit<TInput, TResponse = TInput>(
  action: (formData: TInput) => Promise<ActionResponse<TResponse>>,
  onDialogClose?: () => void,
) {
  const { refresh } = useRouter();

  async function submitForm(formData: TInput, { successTitle, ...toasts }: OutcomeToast) {
    const succeeded = await toastOutcome(() => action(formData), {
      ...toasts,
      successTitle: successTitle || 'Sukces',
    });
    if (!succeeded) return;

    onDialogClose?.();
    refresh();
  }

  return {
    submitForm,
  };
}
