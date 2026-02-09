'use client';

import { use, useState } from 'react';
import { City, Country, Customer, Driver, Truck } from '@/types/types';
import CreateOrderForm from './create-order-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

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
  const [open, setOpen] = useState(false);
  const customersData = use(customers);
  const citiesData = use(cities);
  const driversData = use(drivers);
  const trucksData = use(trucks);
  const countryData = use(countries);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='group'>
          <Plus className='transition-transform group-hover:rotate-45 group-hover:scale-125' />
        </Button>
      </DialogTrigger>

      <DialogContent className='min-w-250 max-w-1/2'>
        <DialogHeader>
          <DialogTitle>Dodaj nowe zlecenie</DialogTitle>
          <DialogDescription>
            Wypełnij wszystkie pola aby dodać nowe zlecenie.
          </DialogDescription>
        </DialogHeader>

        <CreateOrderForm
          customers={customersData}
          cities={citiesData}
          drivers={driversData}
          trucks={trucksData}
          countries={countryData}
          onDialogOpenChange={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
