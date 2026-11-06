import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateCustomerForm from '@/features/OrderForm/components/CustomerForm/create-customer-form';
import { createCustomer } from '@/lib/actions';

const onDialogClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  const user = userEvent.setup();
  render(<CreateCustomerForm onDialogClose={onDialogClose} />);

  return { user };
};

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('NIP'), 'PL7743241555');
  await user.type(screen.getByLabelText('Nazwa zleceniodawcy'), 'DEVIL');
  await user.click(screen.getByRole('button', { name: 'Zapisz' }));
}

describe('CreateCustomerForm', () => {
  it('render form with inputs and button', () => {
    setup();

    screen.getByLabelText('NIP');
    screen.getByLabelText('Nazwa zleceniodawcy');
    screen.getByRole('button', { name: 'Zapisz' });
  });

  it('creates the Customer and closes the dialog once it is created', async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce({ success: true, data: {} } as Awaited<
      ReturnType<typeof createCustomer>
    >);
    const { user } = setup();

    await fillAndSubmit(user);

    expect(createCustomer).toHaveBeenCalledWith({ name: 'DEVIL', tax: 'PL7743241555' });
    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
  });

  it('keeps the dialog open when the Customer is not created', async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce({
      success: false,
      message: 'Zleceniodawca istnieje.',
    });
    const { user } = setup();

    await fillAndSubmit(user);

    await vi.waitFor(() => expect(createCustomer).toHaveBeenCalledOnce());
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  it('not call createCustomer when no or uncorrect data are provided', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCustomer).not.toHaveBeenCalled();
  });
});
