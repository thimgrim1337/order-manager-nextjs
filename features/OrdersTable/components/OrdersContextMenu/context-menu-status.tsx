import { ClockCheck } from 'lucide-react';
import { useState } from 'react';
import Dialog from '@/features/shared/components/ui/dialog';
import { changeOrderStatus } from '@/lib/actions';
import type { ContextMenuOptionProps } from './context-menu';
import OrderStatusMenu from './order-status';

export default function ContextMenuStatus({ order, dialog }: ContextMenuOptionProps) {
  // The Status being sent, held here, not in the menu, which unmounts when the dialog closes mid-write.
  const [chosenStatusId, setChosenStatusId] = useState<number>();

  function handleStatusChange(statusId: number, label: string) {
    setChosenStatusId(statusId);
    dialog.write(() => changeOrderStatus(order.id, statusId), {
      successDescription: `Zlecenie ${order.orderNr} ma teraz status: ${label}.`,
    });
  }

  return (
    <Dialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.onOpenChange}
      icon={<ClockCheck />}
      title="Zmiana statusu zlecenia"
      description={`Wybierz status dla zlecenia nr ${order?.orderNr}`}
    >
      <OrderStatusMenu
        order={order}
        sendingStatusId={dialog.isWriting ? chosenStatusId : undefined}
        onStatusChange={handleStatusChange}
      />
    </Dialog>
  );
}
