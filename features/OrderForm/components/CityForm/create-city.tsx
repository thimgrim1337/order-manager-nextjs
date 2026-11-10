'use client';

import { MapPinPlus } from 'lucide-react';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import useToggle from '../../../shared/hooks/use-toggle';
import FormDialog from '../ui/form-dialog';
import CreateCityForm from './create-city-form';

export default function CreateCity({ countries }: { countries: CountryReadModel[] }) {
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
        <CreateCityForm countries={countries} onDialogClose={closeModal} />
      </div>
    </FormDialog>
  );
}
