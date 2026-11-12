'use client';

import { MapPinPlus } from 'lucide-react';
import type { WriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import FormDialog from '../ui/form-dialog';
import CreateCityForm from './create-city-form';

/** Creates a City in a dialog, handing the created one to `onCreated`. */
export default function CreateCity({
  countries,
  onCreated,
  dialog,
}: {
  countries: CountryReadModel[];
  /**
   * Takes the created City; bound when the create is sent, so a City created after the Order form
   * that sent it closed reaches no form, only the choices the create refreshed.
   */
  onCreated: (city: CityReadModel) => void;
  /** Held by whoever renders the Order dialog, so a create outlives the Order form too. */
  dialog: WriteDialog;
}) {
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
