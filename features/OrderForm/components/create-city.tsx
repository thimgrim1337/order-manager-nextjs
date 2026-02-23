'use client';

import { MapPinPlus } from 'lucide-react';
import Dialog from '@/components/dialog';
import CreateCityForm from './create-city-form';
import { Country } from '@/types/types';
import useToggle from '../hooks/useToggle';

export default function CreateCity({ countries }: { countries: Country[] }) {
  const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
    useToggle();

  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={toggleModal}
      title={
        <>
          <MapPinPlus />
          Dodawanie nowego miejsca
        </>
      }
      description='Wypełnij wszystkie pola aby dodać nowe miejsce.'
    >
      <div className='flex flex-col'>
        <CreateCityForm countries={countries} onDialogClose={closeModal} />
      </div>
    </Dialog>
  );
  1;
}
