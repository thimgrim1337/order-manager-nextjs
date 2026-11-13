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

  describe.each([
    {
      reason: 'CustomerNameTaken',
      label: 'Nazwa zleceniodawcy',
      otherLabel: 'NIP',
      message: 'Zleceniodawca o tej nazwie już istnieje.',
      changed: 'DEVIL2',
    },
    {
      reason: 'CustomerTaxTaken',
      label: 'NIP',
      otherLabel: 'Nazwa zleceniodawcy',
      message: 'Zleceniodawca o tym NIP-ie już istnieje.',
      changed: '5260250995',
    },
  ] as const)('when its $label is taken', ({ reason, label, otherLabel, message, changed }) => {
    const saveTaken = async () => {
      vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.refused(reason));
      const { user } = setup();
      await fillAndSubmit(user);
      await screen.findByText(message);
      return { user };
    };

    it('shows the refusal on that field instead of a toast, keeping the dialog open', async () => {
      await saveTaken();

      expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getAllByText(message)).toHaveLength(1);
      expect(screen.queryByText('Niepowodzenie')).toBeNull();
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    it('keeps the refusal when the other field changes', async () => {
      const { user } = await saveTaken();

      await user.type(screen.getByLabelText(otherLabel), '1');

      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('clears the refusal and saves once that field changes', async () => {
      const { user } = await saveTaken();
      vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded());

      await user.clear(screen.getByLabelText(label));
      await user.type(screen.getByLabelText(label), changed);

      expect(screen.queryByText(message)).toBeNull();
      expect(screen.getByLabelText(label)).not.toHaveAttribute('aria-invalid', 'true');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));
      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
    });
  });

  it('creates a Customer from a Polish NIP of ten digits', async () => {
    vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded());
    const { user } = setup();

    await user.type(screen.getByLabelText('NIP'), '7743241555');
    await user.type(screen.getByLabelText('Nazwa zleceniodawcy'), 'DEVIL');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCustomer).toHaveBeenCalledWith({ name: 'DEVIL', tax: '7743241555' });
  });

  it.each([
    { tax: '7743241556', message: 'Nieprawidłowy NIP.' },
    { tax: 'DE1', message: 'Nieprawidłowy numer VAT.' },
  ])('shows $message on the NIP field for $tax, sending nothing', async ({ tax, message }) => {
    const { user } = setup();

    await user.type(screen.getByLabelText('NIP'), tax);
    await user.type(screen.getByLabelText('Nazwa zleceniodawcy'), 'DEVIL');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('NIP')).toHaveAttribute('aria-invalid', 'true');
    expect(createCustomer).not.toHaveBeenCalled();
  });

  it('not call createCustomer when no or uncorrect data are provided', async () => {
    const { user } = setup();

    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCustomer).not.toHaveBeenCalled();
  });
});
