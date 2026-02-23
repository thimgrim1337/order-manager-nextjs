'use client';

import { use } from 'react';
import { City, Country, Customer, Driver, Truck } from '@/types/types';
import CreateOrderForm from './create-order-form';
import Dialog from '@/components/dialog';
import { FilePlus } from 'lucide-react';
import useToggle from '../hooks/useToggle';

export default function CreateOrder({
  customers,
  cities,
  drivers,
  trucks,
  countries,
}: {
  customers: Promise<Customer[]>;
  cities: Promise<City[]>;
  drivers: Promise<Driver[]>;
  trucks: Promise<Truck[]>;
  countries: Promise<Country[]>;
}) {
  const [isModalOpen, { toggle: toggleModal, setFalse: closeModal }] =
    useToggle();
  const customersData = use(customers);
  const citiesData = use(cities);
  const driversData = use(drivers);
  const trucksData = use(trucks);
  const countryData = use(countries);

  return (
    <Dialog
      isOpen={isModalOpen}
      onOpenChange={toggleModal}
      title={
        <>
          <FilePlus />
          Dodaj nowe zlecenie
        </>
      }
      description='Wypełnij wszystkie pola aby dodać nowe zlecenie.'
      className='min-w-250 max-w-1/2'
    >
      <CreateOrderForm
        customers={customersData}
        cities={citiesData}
        drivers={driversData}
        trucks={trucksData}
        countries={countryData}
        onDialogClose={closeModal}
      />
    </Dialog>
  );
}
