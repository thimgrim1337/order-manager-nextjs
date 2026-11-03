'use client';

import { updateOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import OrderForm from './order-form';

/** The Order form on `order`, saving it back under its id. */
export default function EditOrderForm({
  order,
  onDialogClose,
}: {
  order: OrderReadModel;
  onDialogClose: () => void;
}) {
  return (
    <OrderForm
      order={order}
      action={(formData) => updateOrder(order.id, formData)}
      onDialogClose={onDialogClose}
    />
  );
}
