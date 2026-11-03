import { Pen } from 'lucide-react';
import OrderForm from '@/features/OrderForm/components/order-form';
import Dialog from '@/features/shared/components/ui/dialog';
import { updateOrder } from '@/lib/actions';
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
      <OrderForm
        order={order}
        action={(formData) => updateOrder(order.id, formData)}
        onDialogClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
