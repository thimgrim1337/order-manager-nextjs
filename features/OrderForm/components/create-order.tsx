'use client';

import { FilePlus } from 'lucide-react';
import { createOrder } from '@/lib/actions';
import { useOrderDialog } from '../hooks/use-order-dialog';
import OrderForm from './order-form';
import FormDialog from './ui/form-dialog';

export default function CreateOrder() {
  const dialog = useOrderDialog();

  return (
    <FormDialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.onOpenChange}
      icon={<FilePlus />}
      title={'Dodaj nowe zlecenie'}
      description="Wypełnij wszystkie pola aby dodać nowe zlecenie."
      className="min-w-5xl"
    >
      <OrderForm action={createOrder} dialog={dialog} />
    </FormDialog>
  );
}
