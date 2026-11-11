'use client';

import { useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { FieldGroup } from '@/components/ui/field';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import { settleWrite } from '@/features/shared/lib/settle-write';
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
  onDialogClose: () => void;
};

/** Creates or edits an Order. */
export default function OrderForm({ order, action, onDialogClose }: OrderFormProps) {
  const { cities, countries, currencies, customers, drivers, trucks } = useOrderChoices();

  // Read once per open, so Reset keeps the dates the form opened with.
  const [startingValues] = useState(() => getStartingValues(order));
  const [startingExchangeRate] = useState(() => getStartingExchangeRate(order));
  const [isEditable, setIsEditable] = useState(!order);

  const form = useAppForm({
    ...orderFormOptions,
    defaultValues: startingValues,
    onSubmit: async ({ value }) => {
      if (exchangeRate.error) return;

      await settleWrite(() => action(toOrderInput(value)), {
        closeDialog: onDialogClose,
        successDescription: order
          ? `Pomyślnie zaktualizowano zlecenie o numerze ${value.orderNr}.`
          : `Pomyślnie utworzono zlecenie o numerze ${value.orderNr}.`,
        showOnField: ({ reason, message }) => {
          if (reason !== 'OrderNrTaken') return false;
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

  /** Adds a City created from the form after the Loading Places, beside whose field it is created. */
  const addCreatedLoadingPlace = (city: CityReadModel) =>
    form.setFieldValue('loadingPlaces', (places) =>
      places.some((place) => place.id === city.id) ? places : [...places, city],
    );

  const { endDate, currencyId, priceCurrency } = useStore(form.store, (state) => state.values);
  const exchangeRate = useExchangeRate(startingExchangeRate, endDate, currencyId);

  const fieldGroupStyle = 'flex-row pt-5';

  return (
    <form
      id="order-form"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppForm>
        <fieldset disabled={!isEditable}>
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
            <div className="flex-1 flex gap-2 items-end">
              <form.AppField name="loadingPlaces" mode="array">
                {(field) => <field.PlacesComboboxField cities={cities} label="Miejsca załadunku" />}
              </form.AppField>
              <CreateCity countries={countries} onCreated={addCreatedLoadingPlace} />
            </div>
            <form.AppField name="unloadingPlaces" mode="array">
              {(field) => <field.PlacesComboboxField cities={cities} label="Miejsca rozładunku" />}
            </form.AppField>
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
        </fieldset>
        <form.FormControls
          id={form.formId}
          isEditButton={!!order}
          isEditable={isEditable}
          // Saving without the Exchange Rate would leave the Order without its PLN Price.
          isBlocked={!!exchangeRate.error}
          onEditBtnClick={order ? setIsEditable : undefined}
        />
      </form.AppForm>
    </form>
  );
}
