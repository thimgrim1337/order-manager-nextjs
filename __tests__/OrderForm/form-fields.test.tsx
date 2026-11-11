import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useAppForm } from '@/features/OrderForm/hooks/useAppForm';
import type { CityReadModel } from '@/lib/dal/city.dal';
import { orderChoices } from '../utils/order-choices';
import { renderWithQueries } from '../utils/wrapper';

const choices = orderChoices();
const ERROR = 'Błąd spoza pola';
const icon = <svg aria-hidden="true" />;

/** Every Order form field, untouched, each given an icon and the same external error. */
function FieldsWithExternalError() {
  const form = useAppForm({
    defaultValues: {
      orderNr: '',
      startDate: '',
      currencyId: 0,
      truckId: 0,
      customerId: 0,
      loadingPlaces: [] as CityReadModel[],
    },
  });

  return (
    <form.AppForm>
      <form.AppField name="orderNr">
        {(field) => <field.InputField label="Numer zlecenia" icon={icon} error={ERROR} />}
      </form.AppField>
      <form.AppField name="startDate">
        {(field) => <field.DateField label="Data załadunku" icon={icon} error={ERROR} />}
      </form.AppField>
      <form.AppField name="currencyId">
        {(field) => (
          <field.SelectField
            label="Waluta"
            icon={icon}
            placeholder="Wybierz walutę"
            error={ERROR}
            data={choices.currencies.map((c) => ({ label: c.code, value: c.id }))}
          />
        )}
      </form.AppField>
      <form.AppField name="truckId">
        {(field) => (
          <field.ComboboxField
            label="Pojazd"
            icon={icon}
            placeholder="Wybierz pojazd"
            error={ERROR}
            data={choices.trucks.map((t) => ({ label: t.plate, value: t.id }))}
          />
        )}
      </form.AppField>
      <form.AppField name="customerId">
        {(field) => (
          <field.CustomersComboboxField
            label="Zleceniodawca"
            icon={icon}
            error={ERROR}
            customers={choices.customers}
          />
        )}
      </form.AppField>
      <form.AppField name="loadingPlaces" mode="array">
        {(field) => (
          <field.PlacesComboboxField
            label="Miejsca załadunku"
            icon={icon}
            error={ERROR}
            cities={choices.cities}
          />
        )}
      </form.AppField>
    </form.AppForm>
  );
}

const labels = [
  'Numer zlecenia',
  'Data załadunku',
  'Waluta',
  'Pojazd',
  'Zleceniodawca',
  'Miejsca załadunku',
];

describe('Order form fields', () => {
  it.each(labels)('marks %s invalid when given an external error', async (label) => {
    await renderWithQueries(<FieldsWithExternalError />);

    expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
  });

  it('shows each external error on its field', async () => {
    await renderWithQueries(<FieldsWithExternalError />);

    expect(screen.getAllByText(ERROR)).toHaveLength(labels.length);
  });

  it.each(labels)('passes none of its own props to the %s control', async (label) => {
    await renderWithQueries(<FieldsWithExternalError />);

    const control = screen.getByLabelText(label);
    for (const prop of ['label', 'icon', 'error']) expect(control).not.toHaveAttribute(prop);
  });
});
