'use client';

import CreateCustomerForm from './create-customer-form';
import { HousePlus } from 'lucide-react';
import Dialog from '@/components/dialog';
import useToggle from '../hooks/useToggle';

export default function CreateCustomer() {
  const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
    useToggle();

  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={toggleModal}
      title={
        <>
          <HousePlus />
          Dodawanie nowego zleceniodawcy
        </>
      }
      description='Wypełnij wszystkie pola aby dodać nowego zleceniodawcę.'
    >
      <CreateCustomerForm onModalClose={closeModal} />
    </Dialog>
  );
  1;
}
