import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { removeOrder } from '@/lib/actions';

import type { ContextMenuOptionProps } from './context-menu';

export default function ContextMenuRemove({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  async function handleOrderRemove(orderId: number) {
    try {
      const response = await removeOrder(orderId);
      if (response.success)
        toast.success('Sukces', { description: 'Zlecenie zostało usunięte.', richColors: true });
      else toast.error('Niepowodzenie', { description: response.message, richColors: true });
    } catch (error) {
      toast.error('Niepowodzenie', {
        description: `Nieoczekiwany błąd ${error}`,
        richColors: true,
      });
    }
    onOpenChange(false);
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={isModalOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy jesteś pewny ?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta czynność jest nieodwracalna. Zlecenie zostanie usunięte z bazy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction variant={'destructive'} onClick={() => handleOrderRemove(order.id)}>
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
