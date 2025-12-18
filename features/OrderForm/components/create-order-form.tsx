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
  FormOrderCreate,
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
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CurrencyInfo from '@/features/OrderForm/components/FormFields/CurrencyInfo';
import useCurrencyInfo from '../hooks/useCurrencyInfo';
import { useStore } from '@tanstack/react-form';

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
    onSubmit: ({ value }) => handleSubmit(value),
    onSubmitInvalid: async ({ value }) => {
      const result = orderSchema.safeParse(value);
      if (!result.success) console.error(z.prettifyError(result.error));
    },
  });

  const endDate = useStore(form.store, (state) => state.values.endDate);
  const currencyInfo = useStore(
    form.store,
    (state) => state.values.currencyInfo
  );
  const currency = useStore(form.store, (state) => state.values.currency);

  const { rate, isRateLoading, isRateError, rateErrorMsg } =
    useCurrencyInfo(endDate);

  useEffect(() => {
    if (!rate || currency !== 'EUR') return;

    if (currencyInfo?.date) return;

    form.setFieldValue('currencyInfo', {
      date: rate.rates[0].effectiveDate,
      rate: rate.rates[0].mid.toString(),
      table: rate.rates[0].no,
    });
  }, [rate, form, currencyInfo, currency]);

  async function handleSubmit(order: FormOrderCreate) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error(`Nie udało się utworzyć nowego zlecenia: ${order.orderNr}`);
        return;
      }

      toast.success(`Pomyślnie utworzono nowe zlecenie: ${order.orderNr}`);
      onDialogOpenChange(false);
      refresh();
      resetFilters();
    } catch (error) {
      toast.error(`Wystąpił błąd podczas zapisu zlecenia: ${order.orderNr}`);
    }
  }

  const fieldGroupStyle = 'grid grid-cols-2 pt-5';

  return (
    <>
      <form id='create-order-form' onSubmit={form.handleSubmit}>
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
                  label='Miejsca rozładunku'
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
            validators={{
              onChangeAsync: async ({ value }) => {
                if (value !== 'EUR') return null;

                if (!currencyInfo) {
                  if (isRateLoading) {
                    return { message: 'Trwa pobieranie kursu waluty...' };
                  }
                  if (isRateError) {
                    return {
                      message:
                        rateErrorMsg?.message ||
                        'Brak kursu waluty dla wybranej daty.',
                    };
                  }
                }
                return null;
              },
            }}
            children={(field) => (
              <field.SelectField
                label='Waluta'
                placeholder='Wybierz walutę'
                Icon={<Euro />}
              >
                <CurrencyInfo
                  isLoading={isRateLoading}
                  selectedCurrency={field.state.value}
                  currencyInfo={currencyInfo}
                />
              </field.SelectField>
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
