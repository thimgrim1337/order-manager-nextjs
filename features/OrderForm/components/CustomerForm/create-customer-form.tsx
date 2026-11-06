import { FieldGroup } from '@/components/ui/field';
import { settleWrite } from '@/features/shared/lib/settle-write';
import { createCustomer } from '@/lib/actions';
import { createCustomerSchema } from '@/lib/dto/customer.dto';
import { useAppForm } from '../../hooks/useAppForm';

export default function CreateCustomerForm({ onDialogClose }: { onDialogClose: () => void }) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      tax: '',
    },
    validators: {
      onChange: createCustomerSchema,
    },
    onSubmit: async ({ value }) =>
      settleWrite(() => createCustomer(value), {
        closeDialog: onDialogClose,
        successDescription: `Pomyślnie utworzono nowego zleceniodawcę: ${value.name}`,
      }),
  });

  return (
    <form
      id="create-customer-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField name="name">
            {(field) => <field.InputField label="Nazwa zleceniodawcy" />}
          </form.AppField>
          <form.AppField name="tax">{(field) => <field.InputField label="NIP" />}</form.AppField>
        </FieldGroup>

        <form.FormControls id={form.formId} />
      </form.AppForm>
    </form>
  );
}
