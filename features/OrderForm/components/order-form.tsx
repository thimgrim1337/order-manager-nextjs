'use client';

import { useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { FieldGroup } from '@/components/ui/field';
import { useOrderData } from '@/features/shared/context/order-context';
import type { ActionResponse } from '@/lib/action-response';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import type { OrderDto, OrderFormDto } from '@/lib/dto/order.dto';
import { useAppForm } from '../hooks/useAppForm';
import useExchangeRate from '../hooks/useExchangeRate';
import useFormSubmit from '../hooks/useFormSubmit';
import { getStartingValues, orderFormOptions } from '../lib/order-form-options';
import CreateCity from './CityForm/create-city';
import CreateCustomer from './CustomerForm/create-customer';
import CurrencyInfo from './ui/currency-info';

export type OrderFormProps = {
  /** The Order to edit, locked until the user asks to edit it; without one the form creates an Order. */
  order?: OrderReadModel;
  /** Saves the filled-in Order through the Orders module. */
  action: (formData: OrderFormDto) => Promise<ActionResponse<OrderDto>>;
  onDialogClose: () => void;
};

/** Creates or edits an Order. */
export default function OrderForm({ order, action, onDialogClose }: OrderFormProps) {
  const { cities, countries, currencies, customers, drivers, trucks } = useOrderData();

  const { submitForm } = useFormSubmit(action, onDialogClose);

  // Read once per open, so Reset keeps the dates the form opened with.
  const [startingValues] = useState(() => getStartingValues(order));
  const [isEditable, setIsEditable] = useState(!order);

  const form = useAppForm({
    ...orderFormOptions,
    defaultValues: startingValues,
    onSubmit: async ({ value }) => {
      if (exchangeRate.error) return;

      submitForm(
        { ...value, currencyInfo: exchangeRate.currencyInfo },
        {
          successDescription: order
            ? `Pomyślnie zaktualizowano zlecenie o numerze ${value.orderNr}.`
            : `Pomyślnie utworzono zlecenie o numerze ${value.orderNr}.`,
        },
      );
    },
  });

  const { endDate, currencyId, priceCurrency } = useStore(form.store, (state) => state.values);
  // Saved with the Order in place of the form's `currencyInfo`, which keeps the stored one.
  const exchangeRate = useExchangeRate(startingValues, endDate, currencyId);

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
              <form.AppField name="customerId">
                {(field) => (
                  <field.CustomersComboboxField
                    // Editing, the Order's own Customer may lie outside the preloaded ones.
                    customers={order ? [order.customer] : customers}
                    label="Zleceniodawca"
                  />
                )}
              </form.AppField>
              <CreateCustomer />
            </div>

            <form.AppField name="orderNr">
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
                {(field) => (
                  <field.PlacesComboboxField
                    cities={cities}
                    countries={countries}
                    label="Miejsca załadunku"
                  />
                )}
              </form.AppField>
              <CreateCity countries={countries} />
            </div>
            <form.AppField name="unloadingPlaces" mode="array">
              {(field) => (
                <field.PlacesComboboxField
                  cities={cities}
                  countries={countries}
                  label="Miejsca rozładunku"
                />
              )}
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
              name="truckId"
              listeners={{
                onChange: ({ value }) => {
                  const assignedDriver = trucks.filter((truck) => truck.id === value)[0]?.driverId;

                  if (assignedDriver) form.setFieldValue('driverId', assignedDriver);
                },
              }}
            >
              {(field) => (
                <field.ComboboxField
                  data={trucks.map((truck) => ({
                    value: truck.id,
                    label: truck.plate,
                  }))}
                  label="Pojazd"
                  placeholder="Wybierz pojazd"
                />
              )}
            </form.AppField>
            <form.AppField name="driverId">
              {(field) => (
                <field.ComboboxField
                  data={drivers.map((driver) => ({
                    value: driver.id,
                    label: `${driver.firstName} ${driver.lastName}`,
                  }))}
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
