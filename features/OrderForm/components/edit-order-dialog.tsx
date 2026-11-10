'use client';

import { Pen } from 'lucide-react';
import Dialog from '@/features/shared/components/ui/dialog';
import { updateOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import OrderForm from './order-form';

/** The edit-Order dialog: the Order form on `order`, saving it back under its id. */
export default function EditOrderDialog({
  order,
  isModalOpen,
  onOpenChange,
}: {
  order: OrderReadModel;
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
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
        action={(input) => updateOrder(order.id, input)}
        onDialogClose={() => onOpenChange(false)}
      />
    </Dialog>
  );
}
