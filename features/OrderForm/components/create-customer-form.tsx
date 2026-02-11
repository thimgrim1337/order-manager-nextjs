import {
  CreateCustomerDto,
  createCustomerSchema,
} from '@/lib/dto/customer.dto';
import { useAppForm } from '../hooks/useAppForm';
import { FieldGroup } from '@/components/ui/field';
import { createCustomer } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

export default function CreateCustomerForm({
  onDialogOpenChange,
}: {
  onDialogOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const { refresh } = useRouter();
  const form = useAppForm({
    defaultValues: {
      name: '',
      tax: '',
    },
    validators: {
      onChange: createCustomerSchema,
    },
    onSubmit: async ({ value }) => handleSubmit(value),
  });

  async function handleSubmit(customer: CreateCustomerDto) {
    const response = await createCustomer(customer);

    if (!response.success) {
      return toast.error('Nie udało się utworzyć zleceniodawcy', {
        description: response.message,
        richColors: true,
      });
    }

    refresh();
    onDialogOpenChange(false);
    return toast.success('Pomyślnie utworzono zleceniodawcę', {
      description: `Utworzono zleceniowawcę ${response.data.name} o numerze NIP: ${response.data.tax}`,
      richColors: true,
    });
  }

  return (
    <form
      id='create-customer-form'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField
            name='name'
            children={(field) => (
              <field.InputField label='Nazwa zleceniodawcy' />
            )}
          />
          <form.AppField
            name='tax'
            children={(field) => <field.InputField label='NIP' />}
          />
        </FieldGroup>

        <form.FormControls id={form.formId} />
      </form.AppForm>
    </form>
  );
}
