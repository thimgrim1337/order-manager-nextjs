'use client';

import { updateOrder } from '@/lib/actions';
import type { Order } from '@/types/types';
import OrderForm from './order-form';

/** The Order form on `order`, saving it back under its id. */
export default function EditOrderForm({
  order,
  onDialogClose,
}: {
  order: Order;
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
