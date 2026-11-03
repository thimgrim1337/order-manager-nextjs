'use client';

import { useStore } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { FieldGroup } from '@/components/ui/field';
import { useOrderData } from '@/features/shared/context/order-context';
import type { ActionResponse } from '@/lib/action-response';
import { CURRENCY } from '@/lib/consts';
import type { OrderDto, OrderFormDto } from '@/lib/dto/order.dto';
import type { Order } from '@/types/types';
import { useAppForm } from '../hooks/useAppForm';
import useCurrencyInfo from '../hooks/useCurrencyInfo';
import useFormSubmit from '../hooks/useFormSubmit';
import { getStartingValues, orderFormOptions } from '../lib/order-form-options';
import { toCurrencyInfo } from '../services/nbp.services';
import CreateCity from './CityForm/create-city';
import CreateCustomer from './CustomerForm/create-customer';
import CurrencyInfo from './ui/currency-info';

export type OrderFormProps = {
  /** The Order to edit, locked until the user asks to edit it; without one the form creates an Order. */
  order?: Order;
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
      submitForm(value, {
        successDescription: order
          ? `Pomyślnie zaktualizowano zlecenie o numerze ${value.orderNr}.`
          : `Pomyślnie utworzono zlecenie o numerze ${value.orderNr}.`,
      });
    },
  });

  const { endDate, currencyId, currencyInfo } = useStore(form.store, (state) => state.values);
  // Any Currency but PLN needs its Exchange Rate, from which the Orders module works out the PLN Price.
  const needsRate = currencyId !== CURRENCY.PLN;
  const rateCurrencyCode = needsRate
    ? (currencies.find((currency) => currency.id === currencyId)?.code ?? null)
    : null;

  const {
    rate,
    isLoading: isRateLoading,
    isError: isRateError,
    error: rateError,
  } = useCurrencyInfo(endDate, rateCurrencyCode);

  useEffect(() => {
    if (needsRate && rate?.rates[0]) form.setFieldValue('currencyInfo', toCurrencyInfo(rate));
    // Not keeping the last currency's rate, which would price this one with it.
    else if (form.getFieldValue('currencyInfo').rate)
      form.setFieldValue('currencyInfo', orderFormOptions.defaultValues.currencyInfo);
  }, [needsRate, rate, form]);

  // The currency's validator reads the fetch's outcome, which settles after the currency changed.
  useEffect(() => {
    if (needsRate && !isRateLoading) form.validateField('currencyId', 'change');
  }, [needsRate, isRateLoading, form]);

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
            <form.AppField
              name="currencyId"
              validators={{
                onChangeAsync: async ({ value }) => {
                  if (value === CURRENCY.PLN) return null;

                  if (isRateError)
                    return {
                      message: rateError?.message || 'Wystąpił błąd podczas pobierania kursu.',
                    };
                  return null;
                },
              }}
            >
              {(field) => (
                <field.SelectField
                  label="Waluta"
                  placeholder="Wybierz walutę"
                  data={currencies.map((currency) => ({
                    label: currency.code,
                    value: currency.id,
                  }))}
                >
                  {rateCurrencyCode && (
                    <CurrencyInfo
                      isLoading={isRateLoading}
                      currencyCode={rateCurrencyCode}
                      currencyInfo={currencyInfo}
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
          onEditBtnClick={order ? setIsEditable : undefined}
        />
      </form.AppForm>
    </form>
  );
}
