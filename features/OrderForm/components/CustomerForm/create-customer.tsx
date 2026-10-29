'use client';

import { HousePlus } from 'lucide-react';

import useToggle from '../../../shared/hooks/use-toggle';
import FormDialog from '../ui/form-dialog';
import CreateCustomerForm from './create-customer-form';

export default function CreateCustomer() {
  const [isModalOpen, { setValue: setIsModalOpen, setFalse: closeModal }] = useToggle();

  return (
    <FormDialog
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      icon={<HousePlus />}
      title={'Dodawanie nowego zleceniodawcy'}
      description="Wypełnij wszystkie pola aby dodać nowego zleceniodawcę."
      hideTriggerTitle
    >
      <CreateCustomerForm onDialogClose={closeModal} />
    </FormDialog>
  );
}
