import { FieldGroup } from '@/components/ui/field';
import type { FormWrite } from '@/features/shared/hooks/use-write-dialog';
import { createCity } from '@/lib/actions';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import { createCitySchema } from '@/lib/dto/city.dto';
import { useAppForm } from '../../hooks/useAppForm';

const POLAND_CODE = 'PL';

export default function CreateCityForm({
  countries,
  onCreated,
  dialog,
}: {
  countries: CountryReadModel[];
  /** Takes the created City, with its Country. */
  onCreated: (city: CityReadModel) => void;
  dialog: FormWrite;
}) {
  const form = useAppForm({
    defaultValues: {
      name: '',
      postal: '',
      // A new City is most often Polish; with no Poland among the choices, the user picks one.
      countryId: countries.find((country) => country.code === POLAND_CODE)?.id ?? 0,
    },
    validators: {
      onChange: createCitySchema,
    },
    onSubmit: async ({ value }) =>
      dialog.write(() => createCity(value), {
        onSuccess: onCreated,
        errorTitle: 'Nie udało się utworzyć miejscowości.',
        successDescription: `Pomyślnie utworzono nową miejscowość: ${value.name}`,
      }),
  });

  return (
    <form.AppForm>
      <form.SaveForm isSaving={dialog.isWriting}>
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
      </form.SaveForm>
    </form.AppForm>
  );
}
