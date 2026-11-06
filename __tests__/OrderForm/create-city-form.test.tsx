import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateCityForm from '@/features/OrderForm/components/CityForm/create-city-form';
import { createCity } from '@/lib/actions';
import { deferred } from '../utils/deferred';

const onDialogClose = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  const user = userEvent.setup();
  render(
    <CreateCityForm
      countries={[{ id: 1, code: 'PL', name: 'Poland' }]}
      onDialogClose={onDialogClose}
    />,
  );

  return { user };
};

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox'));
  await user.click(await screen.findByRole('option', { name: 'PL Poland' }));
  await user.type(screen.getByLabelText('Nazwa miejscowości'), 'Kraków');
  await user.type(screen.getByLabelText('Kod pocztowy'), '30-001');
  await user.click(screen.getByRole('button', { name: 'Zapisz' }));
}

describe('CreateCityForm', () => {
  it('render form with inputs and buttons', async () => {
    setup();

    screen.getByLabelText('Nazwa miejscowości');
    screen.getByLabelText('Kod pocztowy');
    screen.getByRole('combobox');
    screen.getByRole('button', { name: 'Zapisz' });
  });

  it('creates the City and closes the dialog once it is created', async () => {
    vi.mocked(createCity).mockResolvedValueOnce({ success: true, data: {} } as Awaited<
      ReturnType<typeof createCity>
    >);
    const { user } = setup();

    await fillAndSubmit(user);

    expect(createCity).toHaveBeenCalledWith({ name: 'Kraków', postal: '30-001', countryId: 1 });
    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
  });

  it('sends one City while it is being created, however often Zapisz is clicked', async () => {
    const create = deferred();
    vi.mocked(createCity).mockReturnValueOnce(
      create.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof createCity>,
    );
    const { user } = setup();

    await fillAndSubmit(user);

    const sending = screen.getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(createCity).toHaveBeenCalledOnce();

    await act(async () => create.resolve());
  });

  it('keeps the dialog open when the City is not created', async () => {
    vi.mocked(createCity).mockResolvedValueOnce({
      success: false,
      message: 'Miejscowość istnieje.',
    });
    const { user } = setup();

    await fillAndSubmit(user);

    await vi.waitFor(() => expect(createCity).toHaveBeenCalledOnce());
    expect(onDialogClose).not.toHaveBeenCalled();
  });

  it('not call createCity when no or uncorrect data are provided', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCity).not.toHaveBeenCalled();
  });
});
