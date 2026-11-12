'use client';

import { Pen } from 'lucide-react';
import Dialog from '@/features/shared/components/ui/dialog';
import type { WriteDialog } from '@/features/shared/hooks/use-write-dialog';
import { updateOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import OrderForm from './order-form';

/** The edit-Order dialog: the Order form on `order`, saving it back under its id. */
export default function EditOrderDialog({
  order,
  dialog,
}: {
  order: OrderReadModel;
  dialog: WriteDialog;
}) {
  return (
    <Dialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.onOpenChange}
      icon={<Pen />}
      title={`Edycja zlecenia ${order.orderNr}`}
      className="min-w-5xl"
    >
      <OrderForm order={order} action={(input) => updateOrder(order.id, input)} dialog={dialog} />
    </Dialog>
  );
}
