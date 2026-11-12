'use client';

import { MapPinPlus } from 'lucide-react';
import { useWriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import FormDialog from '../ui/form-dialog';
import CreateCityForm from './create-city-form';

/** Creates a City in a dialog, handing the created one to `onCreated`. */
export default function CreateCity({
  countries,
  onCreated,
}: {
  countries: CountryReadModel[];
  onCreated: (city: CityReadModel) => void;
}) {
  const dialog = useWriteDialog();

  return (
    <FormDialog
      isOpen={dialog.isOpen}
      onOpenChange={dialog.onOpenChange}
      icon={<MapPinPlus />}
      title="Dodawanie nowego miejsca"
      triggerAriaLabel="Dodaj nowe miejsce"
      description="Wypełnij wszystkie pola aby dodać nowe miejsce."
      hideTriggerTitle
    >
      <CreateCityForm countries={countries} onCreated={onCreated} dialog={dialog} />
    </FormDialog>
  );
}
