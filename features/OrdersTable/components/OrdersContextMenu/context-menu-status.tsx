import { ClockCheck } from 'lucide-react';
import { useState } from 'react';
import Dialog from '@/features/shared/components/ui/dialog';
import { useSettleWrite } from '@/features/shared/hooks/use-settle-write';
import { changeOrderStatus } from '@/lib/actions';
import type { ContextMenuOptionProps } from './context-menu';
import OrderStatusMenu from './order-status';

export default function ContextMenuStatus({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  // Held here, not in the menu, which unmounts when the dialog closes mid-write.
  const [isChanging, settle] = useSettleWrite();
  const [chosenStatusId, setChosenStatusId] = useState<number>();

  function handleStatusChange(statusId: number, label: string) {
    setChosenStatusId(statusId);
    settle(() => changeOrderStatus(order.id, statusId), {
      closeDialog: () => onOpenChange(false),
      successDescription: `Zlecenie ${order.orderNr} ma teraz status: ${label}.`,
    });
  }

  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={onOpenChange}
      icon={<ClockCheck />}
      title="Zmiana statusu zlecenia"
      description={`Wybierz status dla zlecenia nr ${order?.orderNr}`}
    >
      <OrderStatusMenu
        order={order}
        sendingStatusId={isChanging ? chosenStatusId : undefined}
        onStatusChange={handleStatusChange}
      />
    </Dialog>
  );
}
