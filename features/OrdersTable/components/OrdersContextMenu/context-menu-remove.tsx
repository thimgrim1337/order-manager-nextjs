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

import { useSettleWrite } from '@/features/shared/hooks/use-settle-write';
import { removeOrder } from '@/lib/actions';

import type { ContextMenuOptionProps } from './context-menu';

export default function ContextMenuRemove({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  const [isRemoving, settle] = useSettleWrite();

  function handleOrderRemove(orderId: number) {
    settle(() => removeOrder(orderId), {
      closeDialog: () => onOpenChange(false),
      successDescription: 'Zlecenie zostało usunięte.',
    });
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
          <AlertDialogAction
            variant={'destructive'}
            disabled={isRemoving}
            onClick={() => handleOrderRemove(order.id)}
          >
            {isRemoving ? 'Wysyłanie' : 'Usuń'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
