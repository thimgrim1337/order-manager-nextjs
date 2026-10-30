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

import { toastOutcome } from '@/features/shared/lib/toast-outcome';
import { removeOrder } from '@/lib/actions';

import type { ContextMenuOptionProps } from './context-menu';

export default function ContextMenuRemove({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  async function handleOrderRemove(orderId: number) {
    await toastOutcome(() => removeOrder(orderId), {
      successDescription: 'Zlecenie zostało usunięte.',
    });
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
