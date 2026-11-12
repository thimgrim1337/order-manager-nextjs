'use client';

import { useStore } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { FieldGroup } from '@/components/ui/field';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import type { WriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { ActionResponse } from '@/lib/action-response';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { driverName } from '@/lib/drivers';
import type { OrderDto, OrderInputDto } from '@/lib/dto/order.dto';
import { useAppForm } from '../hooks/useAppForm';
import useExchangeRate from '../hooks/useExchangeRate';
import {
  getStartingExchangeRate,
  getStartingValues,
  orderFormOptions,
  toOrderInput,
} from '../lib/order-form-options';
import CreateCity from './CityForm/create-city';
import CreateCustomer from './CustomerForm/create-customer';
import CurrencyInfo from './ui/currency-info';

export type OrderFormProps = {
  /** The Order to edit, locked until the user asks to edit it; without one the form creates an Order. */
  order?: OrderReadModel;
  /** Saves the filled-in Order through the Orders module. */
  action: (input: OrderInputDto) => Promise<ActionResponse<OrderDto>>;
  /** The dialog the form saves through, which knows whether a save runs from an earlier opening. */
  dialog: Pick<WriteDialog, 'write' | 'isWriting'>;
};

/** Creates or edits an Order. */
export default function OrderForm({ order, action, dialog }: OrderFormProps) {
  const { cities, countries, currencies, customers, drivers, trucks } = useOrderChoices();

  // Read once per open, so Reset keeps the dates the form opened with.
  const [startingValues] = useState(() => getStartingValues(order));
  const [startingExchangeRate] = useState(() => getStartingExchangeRate(order));
  // Cities created from this form, newest first, offered in both Places before any search.
  const [createdCities, setCreatedCities] = useState<CityReadModel[]>([]);
  // A save refused after its dialog closed has no field left to show on, so it gets the toast.
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const form = useAppForm({
    ...orderFormOptions,
    defaultValues: startingValues,
    onSubmit: async ({ value }) => {
      await dialog.write(() => action(toOrderInput(value)), {
        successDescription: order
          ? `Pomyślnie zaktualizowano zlecenie o numerze ${value.orderNr}.`
          : `Pomyślnie utworzono zlecenie o numerze ${value.orderNr}.`,
        showOnField: ({ reason, message }) => {
          if (reason !== 'OrderNrTaken' || !isMounted.current) return false;
          setOrderNrRefusal(message);
          return true;
        },
      });
    },
  });

  /**
   * Shows a refused write's message on the Order Number, or drops it with `undefined`. TanStack
   * clears an `onServer` error only on a field with its own validators, so the listeners drop it.
   */
  const setOrderNrRefusal = (message: string | undefined) =>
    form.setFieldMeta('orderNr', (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onServer: message && { message } },
    }));
  const clearOrderNrRefusal = () => setOrderNrRefusal(undefined);

  /** Makes a Customer created from the form the Order's, as picking them in the field does. */
  const pickCreatedCustomer = (customer: CustomerReadModel) => {
    form.setFieldValue('customer', customer);
    clearOrderNrRefusal();
  };

  /** Offers a City created from the form first in both Places, picking it in neither. */
  const offerCreatedCity = (city: CityReadModel) =>
    setCreatedCities((created) => [city, ...created]);

  const { endDate, currencyId, priceCurrency } = useStore(form.store, (state) => state.values);
  const exchangeRate = useExchangeRate(startingExchangeRate, endDate, currencyId);

  const fieldGroupStyle = 'flex-row pt-5';

  return (
    <form.AppForm>
      <form.SaveForm
        // Saving without the Exchange Rate would leave the Order without its PLN Price.
        isBlocked={!!exchangeRate.error}
        isSaving={dialog.isWriting}
        startsLocked={!!order}
      >
        <FieldGroup className="flex-row justify-between">
          <div className="flex-1 flex gap-2 items-end min-w-0">
            <form.AppField
              name="customer"
              listeners={{
                // The Order Number is unique per Customer, so another Customer may use it.
                onChange: clearOrderNrRefusal,
              }}
            >
              {(field) => (
                <field.CustomersComboboxField customers={customers} label="Zleceniodawca" />
              )}
            </form.AppField>
            <CreateCustomer onCreated={pickCreatedCustomer} />
          </div>

          <form.AppField name="orderNr" listeners={{ onChange: clearOrderNrRefusal }}>
            {(field) => <field.InputField label="Numer zlecenia" />}
          </form.AppField>
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField name="startDate">
            {(field) => <field.DateField label="Data załadunku" />}
          </form.AppField>

          <form.AppField name="endDate">
            {(field) => <field.DateField label="Data rozładunku" />}
          </form.AppField>
        </FieldGroup>

        <FieldGroup className={fieldGroupStyle}>
          <form.AppField name="loadingPlaces" mode="array">
            {(field) => (
              <field.PlacesComboboxField
                cities={cities}
                offered={createdCities}
                label="Miejsca załadunku"
              />
            )}
          </form.AppField>
          <div className="flex-1 flex gap-2 items-end">
            <form.AppField name="unloadingPlaces" mode="array">
              {(field) => (
                <field.PlacesComboboxField
                  cities={cities}
                  offered={createdCities}
                  label="Miejsca rozładunku"
                />
              )}
            </form.AppField>
            <CreateCity countries={countries} onCreated={offerCreatedCity} />
          </div>
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField name="priceCurrency">
            {(field) => <field.InputField label="Cena w walucie" type="number" min={0} />}
          </form.AppField>
          <form.AppField name="currencyId">
            {(field) => (
              <field.SelectField
                label="Waluta"
                placeholder="Wybierz walutę"
                error={exchangeRate.error}
                data={currencies.map((currency) => ({
                  label: currency.code,
                  value: currency.id,
                }))}
              >
                {exchangeRate.currencyCode && (
                  <CurrencyInfo
                    isLoading={exchangeRate.isLoading}
                    currencyCode={exchangeRate.currencyCode}
                    currencyInfo={exchangeRate.currencyInfo}
                    priceCurrency={priceCurrency}
                  />
                )}
              </field.SelectField>
            )}
          </form.AppField>
        </FieldGroup>
        <FieldGroup className={fieldGroupStyle}>
          <form.AppField
            name="truck"
            listeners={{
              onChange: ({ value }) => {
                const regularDriver = drivers.find((driver) => driver.id === value?.driverId);

                if (regularDriver) form.setFieldValue('driver', regularDriver);
              },
            }}
          >
            {(field) => (
              <field.SinglePickComboboxField
                choices={trucks}
                itemLabel={(truck) => truck.plate}
                label="Pojazd"
                placeholder="Wybierz pojazd"
              />
            )}
          </form.AppField>
          <form.AppField name="driver">
            {(field) => (
              <field.SinglePickComboboxField
                choices={drivers}
                itemLabel={driverName}
                label="Kierowca"
                placeholder="Wybierz kierowcę"
              />
            )}
          </form.AppField>
        </FieldGroup>
      </form.SaveForm>
    </form.AppForm>
  );
}
