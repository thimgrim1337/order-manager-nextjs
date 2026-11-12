'use client';

import { HousePlus } from 'lucide-react';
import type { WriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import FormDialog from '../ui/form-dialog';
import CreateCustomerForm from './create-customer-form';

/** Creates a Customer in a dialog, handing the created one to `onCreated`. */
export default function CreateCustomer({
  onCreated,
  dialog,
}: {
  /**
   * Takes the created Customer; bound when the create is sent, so a Customer created after the
   * Order form that sent it closed is picked in no form, only offered in the choices the create
   * refreshed.
   */
  onCreated: (customer: CustomerReadModel) => void;
  /** Held by whoever renders the Order dialog, so a create outlives the Order form too. */
  dialog: WriteDialog;
}) {
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
