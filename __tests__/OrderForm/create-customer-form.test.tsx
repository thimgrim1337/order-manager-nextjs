import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// The browser's own Enter: user-event's clicks any submit button inside the form, owned or not.
import { userEvent as browserUser } from 'vitest/browser';
import CreateCustomerForm from '@/features/OrderForm/components/CustomerForm/create-customer-form';
import { createCustomer } from '@/lib/actions';
import { deferred } from '../utils/deferred';
import { idleWriteDialog } from '../utils/idle-write-dialog';
import { writeResponse } from '../utils/write-response';

const onDialogClose = vi.fn();
const onCreated = vi.fn();
const dialog = idleWriteDialog(onDialogClose);

const setup = () => {
  const user = userEvent.setup();
  render(<CreateCustomerForm onCreated={onCreated} dialog={dialog} />);

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
    vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded());
    const { user } = setup();

    await fillAndSubmit(user);

    expect(createCustomer).toHaveBeenCalledWith({ name: 'DEVIL', tax: 'PL7743241555' });
    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
  });

  it('creates the Customer once on Enter in its Tax Number', async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded());
    const { user } = setup();

    await user.type(screen.getByLabelText('Nazwa zleceniodawcy'), 'DEVIL');
    await user.type(screen.getByLabelText('NIP'), 'PL7743241555');
    await browserUser.keyboard('{Enter}');

    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
    expect(createCustomer).toHaveBeenCalledExactlyOnceWith({ name: 'DEVIL', tax: 'PL7743241555' });
  });

  it('sends one Customer while it is being created, however often Zapisz is clicked', async () => {
    const create = deferred();
    vi.mocked(createCustomer).mockReturnValueOnce(
      create.promise.then(() => writeResponse.succeeded()),
    );
    const { user } = setup();

    await fillAndSubmit(user);

    const sending = screen.getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(createCustomer).toHaveBeenCalledOnce();

    await act(async () => create.resolve());
  });

  it('keeps the dialog open when the Customer is not created', async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.refused('CustomerTaken'));
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
