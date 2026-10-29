import { ClockCheck } from 'lucide-react';
import Dialog from '@/features/shared/components/ui/dialog';
import type { ContextMenuOptionProps } from './context-menu';
import OrderStatusMenu from './order-status';

export default function ContextMenuStatus({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={onOpenChange}
      icon={<ClockCheck />}
      title="Zmiana statusu zlecenia"
      description={`Wybierz status dla zlecenia nr ${order?.orderNr}`}
    >
      <OrderStatusMenu order={order} onDialogClose={() => onOpenChange(false)} />
    </Dialog>
  );
}
