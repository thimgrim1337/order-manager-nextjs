'use client';

import { HousePlus } from 'lucide-react';
import { useWriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import FormDialog from '../ui/form-dialog';
import CreateCustomerForm from './create-customer-form';

/** Creates a Customer in a dialog, handing the created one to `onCreated`. */
export default function CreateCustomer({
  onCreated,
}: {
  onCreated: (customer: CustomerReadModel) => void;
}) {
  const dialog = useWriteDialog();

  return (
    <FormDialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.onOpenChange}
      icon={<HousePlus />}
      title={'Dodawanie nowego zleceniodawcy'}
      triggerAriaLabel="Dodaj nowego zleceniodawcę"
      description="Wypełnij wszystkie pola aby dodać nowego zleceniodawcę."
      hideTriggerTitle
    >
      <CreateCustomerForm onCreated={onCreated} dialog={dialog} />
    </FormDialog>
  );
}
