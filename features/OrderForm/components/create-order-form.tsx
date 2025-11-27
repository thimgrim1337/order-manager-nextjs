'use client';

import z from 'zod';
import { useAppForm } from '../hooks/form';
import { useFilters } from '../../OrdersTable/hooks/useFilters';
import { orderFormOptions } from '../lib/order-form-options';
import {
  City,
  Country,
  Customer,
  Driver,
  orderSchema,
  Truck,
} from '@/types/types';
import { toast } from 'sonner';
import { FieldGroup } from '@/components/ui/field';
import {
  Banknote,
  Briefcase,
  CalendarArrowDown,
  CalendarArrowUp,
  Euro,
  Hash,
  MapPinCheck,
  MapPinX,
  TruckIcon,
  User,
} from 'lucide-react';
import { Dispatch, SetStateAction } from 'react';
import { redirect, useRouter } from 'next/navigation';

export default function CreateOrderForm({
  customers,
  cities,
  drivers,
  trucks,
  countries,
  onDialogOpenChange,
}: {
  customers: Customer[];
  cities: City[];
  drivers: Driver[];
  trucks: Truck[];
  countries: Country[];
  onDialogOpenChange: Dispatch<SetStateAction<boolean>>;
}) {
  const { setFilters, resetFilters } = useFilters();
  const { refresh } = useRouter();

  const form = useAppForm({
    ...orderFormOptions,
    validators: {
      onSubmit: orderSchema,
    },
    onSubmit: async ({ value }) => {
      value.pricePLN = value.priceCurrency;
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(`Nie udało się utworzyć nowego zlecenia: ${value.orderNr}`);
      } else {
        toast.success(`Pomyślnie utworzono nowe zlecenie: ${value.orderNr}`);
        onDialogOpenChange(false);
        refresh();
        resetFilters();
      }
    },
    onSubmitInvalid: async ({ value }) => {
      const result = orderSchema.safeParse(value);
      if (!result.success) console.error(z.prettifyError(result.error));
    },
  });

  const fieldGroupStyle = 'grid grid-cols-2 pt-5';

  return (
    <>
      <form id='create-order-form' onSubmit={() => form.handleSubmit()}>
        <FieldGroup className='grid grid-cols-2'>
          <form.AppField
            name='customerId'
            children={(field) => (
              <field.ComboboxField
                data={customers?.map((customer) => ({
                  id: customer.id,
                  value: customer.name,
                }))}
                onSearch={(value) => setFilters({ customer: value })}
                label='Zleceniodwca'
                placeholder='Wybierz zleceniodawcę'
                Icon={<Briefcase />}
              />
            )}
          />
          <form.AppField
            name='orderNr'
            children={(field) => (
              <field.TextField label='Numer zlecenia' Icon={<Hash />} />
            )}
          />
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField
            name='startDate'
            children={(field) => (
              <field.DateField
                label='Data załadunku'
                Icon={<CalendarArrowDown />}
              />
            )}
          />
          <form.AppField
            name='endDate'
            children={(field) => (
              <field.DateField
                label='Data rozładunku'
                Icon={<CalendarArrowUp />}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField
            name='loadingPlaces'
            mode='array'
            children={(field) => {
              return (
                <field.PlaceField
                  label='Miejsca załadunku'
                  cities={cities}
                  countries={countries}
                  Icon={<MapPinCheck />}
                />
              );
            }}
          />
          <form.AppField
            name='unloadingPlaces'
            mode='array'
            children={(field) => {
              return (
                <field.PlaceField
                  label='Miejsca rozaładunku'
                  cities={cities}
                  countries={countries}
                  Icon={<MapPinX />}
                />
              );
            }}
          />
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField
            name='priceCurrency'
            children={(field) => (
              <field.TextField
                label='Cena w walucie'
                Icon={<Banknote />}
                type='number'
                min={0}
              />
            )}
          />
          <form.AppField
            name='currency'
            children={(field) => (
              <field.SelectField
                label='Waluta'
                placeholder='Wybierz walutę'
                Icon={<Euro />}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField
            name='driverId'
            children={(field) => (
              <field.ComboboxField
                data={drivers.map((driver) => ({
                  id: driver.id,
                  value: `${driver.firstName} ${driver.lastName}`,
                }))}
                label='Kierowca'
                placeholder='Wybierz kierowcę'
                Icon={<User />}
              />
            )}
          />
          <form.AppField
            name='truckId'
            children={(field) => (
              <field.ComboboxField
                data={trucks.map((truck) => ({
                  id: truck.id,
                  value: truck.plate,
                }))}
                label='Pojazd'
                placeholder='Wybierz pojazd'
                Icon={<TruckIcon />}
              />
            )}
          />
        </FieldGroup>

        <form.AppForm>
          <form.FormControls id={form.formId} />
        </form.AppForm>
      </form>
    </>
  );
}
