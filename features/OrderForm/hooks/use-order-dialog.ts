import {
  type FormWrite,
  useWriteDialog,
  type WriteDialog,
} from '@/features/shared/hooks/use-write-dialog';

/**
 * An Order's create or edit dialog with the City and Customer create dialogs its form opens, all
 * held by whoever renders the Order dialog, so a City or Customer create outlives the Order
 * dialog's content too, which unmounts on close.
 */
export type OrderDialog = WriteDialog & { city: WriteDialog; customer: WriteDialog };

/** What the Order form saves through: its own write and the create dialogs it opens. */
export type OrderFormWrite = FormWrite & Pick<OrderDialog, 'city' | 'customer'>;

export function useOrderDialog(): OrderDialog {
  const order = useWriteDialog();
  const city = useWriteDialog();
  const customer = useWriteDialog();

  // Closing the Order dialog closes the dialogs inside it, however it closed (a save succeeding
  // with one open), so none opens again with it; a create still running keeps running.
  if (!order.isOpen && city.isOpen) city.onOpenChange(false);
  if (!order.isOpen && customer.isOpen) customer.onOpenChange(false);

  return { ...order, city, customer };
}
