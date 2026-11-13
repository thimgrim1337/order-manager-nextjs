import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
// The browser's own Enter: user-event's clicks any submit button inside the form, owned or not.
import { userEvent as browserUser } from 'vitest/browser';
import CreateCityForm from '@/features/OrderForm/components/CityForm/create-city-form';
import { createCity } from '@/lib/actions';
import { deferred } from '../utils/deferred';
import { idleWriteDialog } from '../utils/idle-write-dialog';
import { renderWithToaster } from '../utils/render-with-toaster';
import { writeResponse } from '../utils/write-response';

const onDialogClose = vi.fn();
const onCreated = vi.fn();
const dialog = idleWriteDialog(onDialogClose);

const setup = () => {
  const user = userEvent.setup();
  renderWithToaster(
    <CreateCityForm
      countries={[{ id: 1, code: 'PL', name: 'Poland' }]}
      onCreated={onCreated}
      dialog={dialog}
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
    vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded());
    const { user } = setup();

    await fillAndSubmit(user);

    expect(createCity).toHaveBeenCalledWith({ name: 'Kraków', postal: '30-001', countryId: 1 });
    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
  });

  it('creates the City once on Enter in its name', async () => {
    vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded());
    const { user } = setup();

    await user.type(screen.getByLabelText('Kod pocztowy'), '30-001');
    await user.type(screen.getByLabelText('Nazwa miejscowości'), 'Kraków');
    await browserUser.keyboard('{Enter}');

    await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
    expect(createCity).toHaveBeenCalledExactlyOnceWith({
      name: 'Kraków',
      postal: '30-001',
      countryId: 1,
    });
  });

  it('defaults the City to Poland, whatever its id', async () => {
    vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded());
    const user = userEvent.setup();
    renderWithToaster(
      <CreateCityForm
        countries={[
          { id: 3, code: 'DE', name: 'Niemcy' },
          { id: 7, code: 'PL', name: 'Polska' },
        ]}
        onCreated={onCreated}
        dialog={dialog}
      />,
    );

    await user.type(screen.getByLabelText('Nazwa miejscowości'), 'Kraków');
    await user.type(screen.getByLabelText('Kod pocztowy'), '30-001');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCity).toHaveBeenCalledWith({ name: 'Kraków', postal: '30-001', countryId: 7 });
  });

  it('sends one City while it is being created, however often Zapisz is clicked', async () => {
    const create = deferred();
    vi.mocked(createCity).mockReturnValueOnce(create.promise.then(() => writeResponse.succeeded()));
    const { user } = setup();

    await fillAndSubmit(user);

    const sending = screen.getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(createCity).toHaveBeenCalledOnce();

    await act(async () => create.resolve());
  });

  describe('when its name is taken', () => {
    const CITY_NAME_TAKEN = 'Miejscowość o tej nazwie już istnieje.';

    const saveTakenName = async () => {
      vi.mocked(createCity).mockResolvedValueOnce(writeResponse.refused('CityNameTaken'));
      const { user } = setup();
      await fillAndSubmit(user);
      await screen.findByText(CITY_NAME_TAKEN);
      return { user };
    };

    it('shows the refusal on the name field instead of a toast, keeping the dialog open', async () => {
      await saveTakenName();

      expect(screen.getByLabelText('Nazwa miejscowości')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getAllByText(CITY_NAME_TAKEN)).toHaveLength(1);
      expect(screen.queryByText(/Nie udało się/)).toBeNull();
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    it('keeps the refusal when another field changes', async () => {
      const { user } = await saveTakenName();

      await user.type(screen.getByLabelText('Kod pocztowy'), '1');

      expect(screen.getByText(CITY_NAME_TAKEN)).toBeInTheDocument();
    });

    it('clears the refusal and saves once the name changes', async () => {
      const { user } = await saveTakenName();
      vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded());

      await user.type(screen.getByLabelText('Nazwa miejscowości'), 'a');

      expect(screen.queryByText(CITY_NAME_TAKEN)).toBeNull();
      expect(screen.getByLabelText('Nazwa miejscowości')).not.toHaveAttribute(
        'aria-invalid',
        'true',
      );
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));
      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalledOnce());
    });
  });

  it('not call createCity when no or uncorrect data are provided', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    expect(createCity).not.toHaveBeenCalled();
  });
});
