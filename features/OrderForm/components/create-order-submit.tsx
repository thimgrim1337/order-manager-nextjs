import { createOrder } from '@/lib/actions';
import { CreateOrderFormDto } from '@/lib/dto/order.dto';
import { FormSubmit } from '@/types/types';
import { toast } from 'sonner';

export async function submitOrder(
  {
    refresh,
    onDialogClose,
    resetFilters,
  }: FormSubmit & { resetFilters: () => void },
  order: CreateOrderFormDto,
) {
  const response = await createOrder(order);

  if (!response.success) {
    return toast.error('Nie udało się utworzyć nowego zlecenia', {
      description: response.message,
      richColors: true,
    });
  }

  onDialogClose();
  resetFilters();
  refresh();
  return toast.success(`Pomyślnie utworzono nowe zlecenie`, {
    description: `Utworzono nowe zlecenie o numerze: ${response.data.orderNr}`,
    richColors: true,
  });
}
