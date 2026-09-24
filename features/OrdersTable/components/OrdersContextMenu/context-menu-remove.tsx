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

import { deleteOrder } from '@/lib/actions';

import type { ContextMenuOptionProps } from './context-menu';

export default function ContextMenuRemove({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  async function handleOrderRemove(orderId: number) {
    await deleteOrder(orderId);
    onOpenChange();
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
