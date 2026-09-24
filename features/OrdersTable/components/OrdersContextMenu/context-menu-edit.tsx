import { Pen } from 'lucide-react';
import EditOrderForm from '@/features/OrderForm/components/edit-order-form';
import Dialog from '@/features/shared/components/ui/dialog';
import type { ContextMenuOptionProps } from './context-menu';

export default function ContextMenuOrderEdit({
  order,
  isModalOpen,
  onOpenChange,
}: ContextMenuOptionProps) {
  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={onOpenChange}
      icon={<Pen />}
      title={`Edycja zlecenia ${order.orderNr}`}
      className="min-w-5xl"
    >
      <EditOrderForm order={order} onDialogClose={onOpenChange} />
    </Dialog>
  );
}
