import CreateCustomerForm from '@/features/OrderForm/components/CustomerForm/create-customer-form';
import { render, screen } from '@testing-library/react';
import { beforeAll, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

const submitFormMock = vi.hoisted(() => vi.fn());
vi.mock('@/features/OrderForm/hooks/useFormSubmit', () => ({
  default: () => ({ submitForm: submitFormMock }),
}));

beforeAll(() => {
  render(<CreateCustomerForm onDialogClose={vi.fn()} />);
});

it('render form with inputs and button', () => {
  screen.getByLabelText('NIP');
  screen.getByLabelText('Nazwa zleceniodawcy');
  screen.getByRole('button', { name: 'Dodaj' });
});

it('fire submitForm when click on button', async () => {
  const user = userEvent.setup();

  const taxInput = screen.getByLabelText('NIP');
  const nameInput = screen.getByLabelText('Nazwa zleceniodawcy');
  const submitButton = screen.getByRole('button', { name: 'Dodaj' });

  await user.type(taxInput, 'PL7743241555');
  await user.type(nameInput, 'DEVIL');

  await user.click(submitButton);

  expect(submitFormMock).toHaveBeenCalledOnce();
});
