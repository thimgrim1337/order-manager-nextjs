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

export default function ContextMenuRemove({ order, dialog }: ContextMenuOptionProps) {
  function handleOrderRemove(orderId: number) {
    dialog.write(() => removeOrder(orderId), {
      successDescription: 'Zlecenie zostało usunięte.',
    });
  }

  return (
    <AlertDialog onOpenChange={dialog.onOpenChange} open={dialog.isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy jesteś pewny ?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta czynność jest nieodwracalna. Zlecenie zostanie usunięte z bazy.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            variant={'destructive'}
            disabled={dialog.isWriting}
            onClick={() => handleOrderRemove(order.id)}
          >
            {dialog.isWriting ? 'Wysyłanie' : 'Usuń'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
