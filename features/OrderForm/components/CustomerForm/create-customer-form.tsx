import { FieldGroup } from '@/components/ui/field';
import type { FormWrite } from '@/features/shared/hooks/use-write-dialog';
import { createCustomer } from '@/lib/actions';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { createCustomerSchema } from '@/lib/dto/customer.dto';
import { useAppForm } from '../../hooks/useAppForm';

export default function CreateCustomerForm({
  onCreated,
  dialog,
}: {
  /** Takes the created Customer. */
  onCreated: (customer: CustomerReadModel) => void;
  dialog: FormWrite;
}) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      tax: '',
    },
    validators: {
      onChange: createCustomerSchema,
    },
    onSubmit: async ({ value }) =>
      dialog.write(() => createCustomer(value), {
        onSuccess: onCreated,
        successDescription: `Pomyślnie utworzono nowego zleceniodawcę: ${value.name}`,
      }),
  });

  return (
    <form.AppForm>
      <form.SaveForm isSaving={dialog.isWriting}>
        <FieldGroup>
          <form.AppField name="name">
            {(field) => <field.InputField label="Nazwa zleceniodawcy" />}
          </form.AppField>
          <form.AppField name="tax">{(field) => <field.InputField label="NIP" />}</form.AppField>
        </FieldGroup>
      </form.SaveForm>
    </form.AppForm>
  );
}
