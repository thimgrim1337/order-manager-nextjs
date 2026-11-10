import { FieldGroup } from '@/components/ui/field';
import { settleWrite } from '@/features/shared/lib/settle-write';
import { createCity } from '@/lib/actions';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import { createCitySchema } from '@/lib/dto/city.dto';
import { useAppForm } from '../../hooks/useAppForm';

export default function CreateCityForm({
  countries,
  onDialogClose,
}: {
  countries: CountryReadModel[];
  onDialogClose: () => void;
}) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      postal: '',
      countryId: 25,
    },
    validators: {
      onChange: createCitySchema,
    },
    onSubmit: async ({ value }) =>
      settleWrite(() => createCity(value), {
        closeDialog: onDialogClose,
        errorTitle: 'Nie udało się utworzyć miejscowości.',
        successDescription: `Pomyślnie utworzono nową miejscowość: ${value.name}`,
      }),
  });

  return (
    <form
      id="create-city-form"
      data-testid="create-city-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField name="countryId">
            {(field) => <field.CountrySelectField countries={countries} />}
          </form.AppField>
          <form.AppField name="postal">
            {(field) => <field.InputField label="Kod pocztowy" />}
          </form.AppField>
          <form.AppField name="name">
            {(field) => <field.InputField label="Nazwa miejscowości" />}
          </form.AppField>
        </FieldGroup>
        <form.FormControls id={form.formId} />
      </form.AppForm>
    </form>
  );
}
