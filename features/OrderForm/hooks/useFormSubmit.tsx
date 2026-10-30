import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { ActionResponse } from '@/lib/action-response';

type ToastMessage = {
  errorTitle?: string;
  successTitle?: string;
  successDescription?: string;
};

export default function useFormSubmit<TInput, TResponse = TInput>(
  action: (formData: TInput) => Promise<ActionResponse<TResponse>>,
  onDialogClose?: () => void,
) {
  const { refresh } = useRouter();

  async function submitForm(
    formData: TInput,
    { errorTitle, successTitle, successDescription }: ToastMessage,
  ) {
    try {
      const response = await action(formData);

      if (!response.success) {
        return toast.error(errorTitle || 'Niepowodzenie', {
          description: response.message,
          richColors: true,
        });
      }

      onDialogClose?.();
      refresh();

      return toast.success(successTitle || 'Sukces', {
        description: successDescription,
        richColors: true,
      });
    } catch (error) {
      return toast.error(errorTitle || 'Niepowodzenie', {
        description: `Nieoczekiwany błąd ${error}`,
        richColors: true,
      });
    }
  }

  return {
    submitForm,
  };
}
