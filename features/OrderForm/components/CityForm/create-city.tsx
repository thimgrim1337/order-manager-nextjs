'use client';

import { MapPinPlus } from 'lucide-react';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import useToggle from '../../../shared/hooks/use-toggle';
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
  const [isModalOpen, { setValue: setIsModalOpen, setFalse: closeModal }] = useToggle();

  return (
    <FormDialog
      isOpen={isModalOpen}
      onOpenChange={setIsModalOpen}
      icon={<MapPinPlus />}
      title={'	Dodawanie nowego miejsca'}
      triggerAriaLabel="Dodaj nowe miejsce"
      description="Wypełnij wszystkie pola aby dodać nowe miejsce."
      hideTriggerTitle
    >
      <div className="flex flex-col">
        <CreateCityForm countries={countries} onCreated={onCreated} onDialogClose={closeModal} />
      </div>
    </FormDialog>
  );
}
