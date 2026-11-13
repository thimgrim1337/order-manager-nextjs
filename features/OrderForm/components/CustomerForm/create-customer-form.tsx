import { FieldGroup } from '@/components/ui/field';
import { type FieldRefusal, useFieldRefusals } from '@/features/shared/hooks/use-field-refusals';
import type { FormWrite } from '@/features/shared/hooks/use-write-dialog';
import { createCustomer } from '@/lib/actions';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import { type CreateCustomerDto, createCustomerSchema } from '@/lib/dto/customer.dto';
import { useAppForm } from '../../hooks/useAppForm';

/** A Customer's name and NIP are each unique, so a taken one stops applying once it changes. */
const REFUSALS: FieldRefusal<CreateCustomerDto>[] = [
  { reason: 'CustomerNameTaken', field: 'name', clearedBy: ['name'] },
  { reason: 'CustomerTaxTaken', field: 'tax', clearedBy: ['tax'] },
];

export default function CreateCustomerForm({
  onCreated,
  dialog,
}: {
  /** Takes the created Customer. */
  onCreated: (customer: CustomerReadModel) => void;
  dialog: FormWrite;
}) {
  const refusals = useFieldRefusals(REFUSALS);

  const form = useAppForm({
    defaultValues: {
      name: '',
      tax: '',
    },
    validators: {
      onChange: createCustomerSchema,
    },
    listeners: refusals.listeners,
    onSubmit: async ({ value, formApi }) =>
      dialog.write(() => createCustomer(value), {
        onSuccess: onCreated,
        successDescription: `Pomyślnie utworzono nowego zleceniodawcę: ${value.name}`,
        showOnField: refusals.showOnField(formApi),
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
