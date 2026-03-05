import { beforeAll, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import CreateCityForm from '@/features/OrderForm/components/CityForm/create-city-form';

const submitFormMock = vi.hoisted(() => vi.fn());
vi.mock('@/features/OrderForm/hooks/useFormSubmit', () => ({
  default: () => ({ submitForm: submitFormMock }),
}));

const onDialogClose = vi.fn();

beforeAll(() => {
  render(
    <CreateCityForm
      countries={[{ id: 1, code: 'PL', name: 'Poland' }]}
      onDialogClose={onDialogClose}
    />,
  );
});

it('render form with inputs', async () => {
  screen.getByLabelText('Nazwa miejscowości');
  screen.getByLabelText('Kod pocztowy');
  screen.getByRole('combobox');
});

it('fire submitForm when button is clicked', async () => {
  const user = userEvent.setup();

  await user.click(screen.getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: 'PL Poland' }));

  await user.type(screen.getByLabelText('Nazwa miejscowości'), 'Kraków');
  await user.type(screen.getByLabelText('Kod pocztowy'), '30-001');

  await user.click(screen.getByRole('button', { name: 'Dodaj' }));

  expect(submitFormMock).toHaveBeenCalledTimes(1);
});
