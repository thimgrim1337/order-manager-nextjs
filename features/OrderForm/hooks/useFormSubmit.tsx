import { ActionResponse } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type SubmitForm<T> = {
  action: (formData: T) => ActionResponse<T>;
  onDialogClose: () => void;
};

type ToastMessage = {
  errorTitle: string;
  successTitle: string;
  successDescription?: string;
};

export default function useFormSubmit<T>({
  action,
  onDialogClose,
}: SubmitForm<T>) {
  const { refresh } = useRouter();

  async function submitForm(
    formData: T,
    { errorTitle, successTitle, successDescription }: ToastMessage,
  ) {
    const response = await action(formData);

    if (!('success' in response)) {
      return toast.error(errorTitle, {
        description: response?.message,
        richColors: true,
      });
    }

    onDialogClose();
    refresh();

    return toast.success(successTitle, {
      description: successDescription,
      richColors: true,
    });
  }

  return {
    submitForm,
  };
}
