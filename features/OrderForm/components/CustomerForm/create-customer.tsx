'use client';

import { HousePlus } from 'lucide-react';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';

import useToggle from '../../../shared/hooks/use-toggle';
import FormDialog from '../ui/form-dialog';
import CreateCustomerForm from './create-customer-form';

/** Creates a Customer in a dialog, handing the created one to `onCreated`. */
export default function CreateCustomer({
  onCreated,
}: {
  onCreated: (customer: CustomerReadModel) => void;
}) {
  const [isModalOpen, { setValue: setIsModalOpen, setFalse: closeModal }] = useToggle();

  return (
    <FormDialog
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      icon={<HousePlus />}
      title={'Dodawanie nowego zleceniodawcy'}
      triggerAriaLabel="Dodaj nowego zleceniodawcę"
      description="Wypełnij wszystkie pola aby dodać nowego zleceniodawcę."
      hideTriggerTitle
    >
      <CreateCustomerForm onCreated={onCreated} onDialogClose={closeModal} />
    </FormDialog>
  );
}
