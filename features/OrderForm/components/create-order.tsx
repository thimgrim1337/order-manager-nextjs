'use client';

import { FilePlus } from 'lucide-react';
import { createOrder } from '@/lib/actions';
import useToggle from '../../shared/hooks/use-toggle';
import OrderForm from './order-form';
import FormDialog from './ui/form-dialog';

export default function CreateOrder() {
  const [isModalOpen, { setValue: setIsModalOpen, setFalse: closeModal }] = useToggle();

  return (
    <FormDialog
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      icon={<FilePlus />}
      title={'Dodaj nowe zlecenie'}
      description="Wypełnij wszystkie pola aby dodać nowe zlecenie."
      className="min-w-5xl"
    >
      <OrderForm action={createOrder} onDialogClose={closeModal} />
    </FormDialog>
  );
}
