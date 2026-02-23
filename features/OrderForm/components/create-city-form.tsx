import { CreateCityDto, createCitySchema } from '@/lib/dto/city.dto';
import { useAppForm } from '../hooks/useAppForm';
import { FieldGroup } from '@/components/ui/field';
import { Country } from '@/types/types';
import { createCity } from '@/lib/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import 'country-flag-icons/3x2/flags.css';

export default function CreateCityForm({
  countries,
  onDialogClose,
}: {
  countries: Country[];
  onDialogClose: () => void;
}) {
  const { refresh } = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: '',
      postal: '',
      countryId: 0,
    },
    validators: {
      onChange: createCitySchema,
    },
    onSubmit: async ({ value }) => handleSubmit(value),
  });

  async function handleSubmit(city: CreateCityDto) {
    const response = await createCity(city);

    if (!response.success) {
      return toast.error('Nie udało się utworzyć miejscowości.', {
        description: response.message,
        richColors: true,
      });
    }

    refresh();
    onDialogClose();
    return toast.success('Pomyślnie utworzono miejsowość', {
      description: `Utworzono miejsowość ${response?.data?.name}.`,
      richColors: true,
    });
  }

  return (
    <form
      id='create-city-form'
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <FieldGroup>
          <form.AppField
            name='countryId'
            children={(field) => (
              <field.SelectField
                label='Kod kraju'
                placeholder='Wybierz kraj'
                data={countries?.map((country) => ({
                  id: country.id,
                  value: `${country.code} ${country.name}`,
                  icon: <span className={`flag:${country.code}`}></span>,
                }))}
              />
            )}
          />
          <form.AppField
            name='postal'
            children={(field) => <field.InputField label='Kod pocztowy' />}
          />
          <form.AppField
            name='name'
            children={(field) => (
              <field.InputField label='Nazwa miejscowości' />
            )}
          />
        </FieldGroup>
        <form.FormControls id={form.formId} />
      </form.AppForm>
    </form>
  );
}
