import { act, screen, within } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { Toaster } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// The browser's own input: user-event's Enter clicks any submit button inside the form, whether
// the form owns it or not, so it passes where the browser's Enter submits nothing.
import { userEvent as browserUser } from 'vitest/browser';
import OrderForm, { type OrderFormProps } from '@/features/OrderForm/components/order-form';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import {
  createCity,
  createCustomer,
  createOrder,
  searchCities,
  searchCustomers,
  updateOrder,
} from '@/lib/actions';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { orderReadModel } from '../fixtures/order-read-model';
import { worker } from '../mocks/browser';
import { NBP_RATES_URL, nbpApiServing } from '../mocks/handlers';
import { deferred } from '../utils/deferred';
import { openDialog } from '../utils/open-dialog';
import { orderChoices } from '../utils/order-choices';
import { pickDate } from '../utils/pick-date';
import { renderWithQueries } from '../utils/wrapper';
import { writeResponse } from '../utils/write-response';

const choices = orderChoices();
// A Place whose Country is not among the choices' Countries: the form shows it from the City.
const berlin = {
  id: 21,
  name: 'Berlin',
  postal: '10115',
  countryId: 2,
  country: { id: 2, name: 'Germany', code: 'DE' },
};
const [plock] = choices.cities;
const [customer] = choices.customers;
// A Customer beyond the preloaded ones, found by searching.
const angel: CustomerReadModel = { id: 5, name: 'ANGEL', tax: '5260250995' };

// A Customer and a City the tests create from the Order form.
const nowaFirma: CustomerReadModel = { id: 9, name: 'Nowa Firma', tax: 'PL9876543210' };
const krakow: CityReadModel = { ...plock, id: 12, name: 'Kraków', postal: '30-001' };

/** Creates a Customer through the Order form's create dialog. */
const createCustomerInDialog = async (user: UserEvent) => {
  const dialog = await openDialog(
    user,
    'Dodaj nowego zleceniodawcę',
    'Dodawanie nowego zleceniodawcy',
  );
  await user.type(within(dialog).getByLabelText('Nazwa zleceniodawcy'), nowaFirma.name);
  await user.type(within(dialog).getByLabelText('NIP'), nowaFirma.tax);
  await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));
  return dialog;
};

/** Creates a City through the Order form's create dialog. */
const createCityInDialog = async (user: UserEvent) => {
  const dialog = await openDialog(user, 'Dodaj nowe miejsce', 'Dodawanie nowego miejsca');
  await user.type(within(dialog).getByLabelText('Kod pocztowy'), krakow.postal);
  await user.type(within(dialog).getByLabelText('Nazwa miejscowości'), krakow.name);
  await user.click(within(dialog).getByRole('button', { name: 'Zapisz' }));
  return dialog;
};

/** Opens a Places field's list, before anything is typed, and reads its choices in order. */
const placeChoices = async (user: UserEvent, label: string) => {
  await user.keyboard('{Escape}');
  await user.click(screen.getByLabelText(label));
  const options = await screen.findAllByRole('option');
  return options.map((option) => option.textContent);
};

/** The Customer search answers `answers[term]` for each term, and finds no one for any other. */
const customerSearchAnswers = (answers: Record<string, CustomerReadModel[]>) =>
  vi.mocked(searchCustomers).mockImplementation(async (term) => answers[term] ?? []);

/** Opens the date field labelled `label` and reads the month its calendar shows, then closes it. */
const calendarMonth = async (user: UserEvent, label: string) => {
  await user.click(screen.getByLabelText(label));
  const month = screen.getByRole('grid').getAttribute('aria-label');
  await user.keyboard('{Escape}');
  return month;
};

/** Lets a save that slipped through reach its write, before a test says none was sent. */
const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));

/** NBP answers with a server error. */
const failNbp = () =>
  worker.use(http.get(NBP_RATES_URL, () => HttpResponse.json({}, { status: 500 })));

beforeEach(() => {
  customerSearchAnswers({ ANG: [angel] });
  vi.mocked(createOrder).mockResolvedValue(writeResponse.succeeded());
  vi.useFakeTimers({ toFake: ['Date'] });
  // Monday 2026-11-02 12:00 in Warsaw, so the date pickers show November 2026.
  vi.setSystemTime(new Date('2026-11-02T11:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

const setup = async (props: Partial<OrderFormProps> = {}) => {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  const onDialogClose = vi.fn();

  const { unmount } = await renderWithQueries(
    <OrderChoicesProvider choices={choices}>
      <OrderForm action={createOrder} onDialogClose={onDialogClose} {...props} />
      {/* sonner's own, as in `renderWithToaster`, which can't wrap `renderWithQueries`. */}
      <Toaster />
    </OrderChoicesProvider>,
  );

  return { user, onDialogClose, unmount };
};

/** Fills in every field of a new PLN Order, ZL-12 for DEVIL from Płock to Płock on 12–13 November. */
const fillInNewOrder = async (user: UserEvent) => {
  await user.click(screen.getByLabelText('Zleceniodawca'));
  await user.click(screen.getByRole('option', { name: 'DEVIL' }));
  await user.type(screen.getByLabelText('Numer zlecenia'), 'ZL-12');
  await pickDate(user, 'Data załadunku', 12);
  await pickDate(user, 'Data rozładunku', 13);
  await user.click(screen.getByLabelText('Miejsca załadunku'));
  await user.click(screen.getByRole('option', { name: 'Płock' }));
  await user.click(screen.getByLabelText('Miejsca rozładunku'));
  await user.click(screen.getByRole('option', { name: 'Płock' }));
  await user.clear(screen.getByLabelText('Cena w walucie'));
  await user.type(screen.getByLabelText('Cena w walucie'), '1000');
  await user.click(screen.getByLabelText('Pojazd'));
  await user.click(screen.getByRole('option', { name: 'WND0997C' }));
};

describe('OrderForm', () => {
  describe('create', () => {
    it('submits a new PLN Order to the Orders module and closes the dialog', async () => {
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);

      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledExactlyOnceWith({
        orderNr: 'ZL-12',
        startDate: '2026-11-12',
        endDate: '2026-11-13',
        customerId: 1,
        driverId: 1,
        truckId: 1,
        statusId: 1,
        priceCurrency: '1000',
        currencyId: 1,
        loadingPlaces: [plock.id],
        unloadingPlaces: [plock.id],
      });
    });

    it("shows a refused Order's reason in a toast and keeps the dialog open", async () => {
      vi.mocked(createOrder).mockResolvedValueOnce(writeResponse.refused('UnknownTruck'));
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await expect.poll(() => screen.queryByText('Wybrany pojazd nie istnieje.')).toBeVisible();
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    describe('an Order Number the Customer already uses', () => {
      const ORDER_NR_TAKEN = 'Zlecenie o tym numerze już istnieje.';

      const saveTakenOrderNr = async () => {
        vi.mocked(createOrder).mockResolvedValueOnce(writeResponse.refused('OrderNrTaken'));
        const rendered = await setup();
        await fillInNewOrder(rendered.user);
        await rendered.user.click(screen.getByRole('button', { name: 'Zapisz' }));
        await screen.findByText(ORDER_NR_TAKEN);
        return rendered;
      };

      it('shows the error on the Order Number field instead of a toast', async () => {
        const { onDialogClose } = await saveTakenOrderNr();

        expect(screen.getByLabelText('Numer zlecenia')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getAllByText(ORDER_NR_TAKEN)).toHaveLength(1);
        expect(screen.queryByText('Niepowodzenie')).toBeNull();
        expect(onDialogClose).not.toHaveBeenCalled();
      });

      it('clears the error and saves once the Order Number changes', async () => {
        const { user, onDialogClose } = await saveTakenOrderNr();

        await user.type(screen.getByLabelText('Numer zlecenia'), 'A');

        expect(screen.queryByText(ORDER_NR_TAKEN)).toBeNull();
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));
        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(createOrder).toHaveBeenLastCalledWith(
          expect.objectContaining({ orderNr: 'ZL-12A' }),
        );
      });

      it('clears the error once another Customer is picked, who may use the same Order Number', async () => {
        const { user } = await saveTakenOrderNr();

        await user.clear(screen.getByLabelText('Zleceniodawca'));
        await user.type(screen.getByLabelText('Zleceniodawca'), 'ANG');
        await user.click(await screen.findByRole('option', { name: 'ANGEL' }));

        expect(screen.queryByText(ORDER_NR_TAKEN)).toBeNull();
        expect(screen.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
      });
    });

    describe('creating a Customer or a City from the form', () => {
      it('picks the created Customer', async () => {
        vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded(nowaFirma));
        const { user, onDialogClose } = await setup();
        await fillInNewOrder(user);

        const dialog = await createCustomerInDialog(user);

        await expect.poll(() => dialog).not.toBeInTheDocument();
        expect(screen.getByLabelText('Zleceniodawca')).toHaveValue('Nowa Firma');
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));
        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(createOrder).toHaveBeenCalledWith(
          expect.objectContaining({ customerId: nowaFirma.id }),
        );
      });

      it("clears the Order Number's refusal, as picking another Customer does", async () => {
        vi.mocked(createOrder).mockResolvedValueOnce(writeResponse.refused('OrderNrTaken'));
        vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded(nowaFirma));
        const { user } = await setup();
        await fillInNewOrder(user);
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));
        await screen.findByText('Zlecenie o tym numerze już istnieje.');

        const dialog = await createCustomerInDialog(user);

        await expect.poll(() => dialog).not.toBeInTheDocument();
        expect(screen.queryByText('Zlecenie o tym numerze już istnieje.')).toBeNull();
        expect(screen.getByLabelText('Numer zlecenia')).not.toHaveAttribute('aria-invalid', 'true');
      });

      it('picks no Customer when the create is refused', async () => {
        vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.refused('CustomerTaken'));
        const { user } = await setup();
        await fillInNewOrder(user);

        await createCustomerInDialog(user);

        await screen.findByText('Ten zleceniodawca już istnieje.');
        expect(screen.getByLabelText('Zleceniodawca')).toHaveValue('DEVIL');
      });

      it('offers the created City first in both Places, picking it in neither', async () => {
        vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded(krakow));
        const { user, onDialogClose } = await setup();
        await fillInNewOrder(user);

        const dialog = await createCityInDialog(user);

        await expect.poll(() => dialog).not.toBeInTheDocument();
        expect(screen.queryByText('30-001')).not.toBeInTheDocument();
        expect(await placeChoices(user, 'Miejsca załadunku')).toEqual(['Kraków', 'Płock']);
        expect(await placeChoices(user, 'Miejsca rozładunku')).toEqual(['Kraków', 'Płock']);
        await user.click(screen.getByRole('option', { name: 'Kraków' }));
        await user.keyboard('{Escape}');
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));
        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(createOrder).toHaveBeenCalledWith(
          expect.objectContaining({
            loadingPlaces: [plock.id],
            unloadingPlaces: [plock.id, krakow.id],
          }),
        );
      });

      it('offers Cities created one after another newest first, each once', async () => {
        vi.mocked(createCity)
          .mockResolvedValueOnce(writeResponse.succeeded(krakow))
          .mockResolvedValueOnce(writeResponse.succeeded(plock));
        const { user } = await setup();

        const krakowDialog = await createCityInDialog(user);
        await expect.poll(() => krakowDialog).not.toBeInTheDocument();
        const plockDialog = await createCityInDialog(user);
        await expect.poll(() => plockDialog).not.toBeInTheDocument();

        expect(await placeChoices(user, 'Miejsca załadunku')).toEqual(['Płock', 'Kraków']);
        expect(await placeChoices(user, 'Miejsca rozładunku')).toEqual(['Płock', 'Kraków']);
      });

      it('offers the created City ahead of a picked City found by searching', async () => {
        const zgierz = { ...plock, id: 11, name: 'Zgierz', postal: '95-100' };
        vi.mocked(searchCities).mockResolvedValue([zgierz]);
        vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded(krakow));
        const { user } = await setup();
        await user.type(screen.getByLabelText('Miejsca załadunku'), 'Zgi');
        await user.click(await screen.findByRole('option', { name: 'Zgierz' }));

        const dialog = await createCityInDialog(user);

        await expect.poll(() => dialog).not.toBeInTheDocument();

        expect(await placeChoices(user, 'Miejsca załadunku')).toEqual([
          'Kraków',
          'Zgierz',
          'Płock',
        ]);
      });

      it('creates the City once on Enter in its name, not saving the Order behind it', async () => {
        vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded(krakow));
        const { user } = await setup();
        await fillInNewOrder(user);

        const dialog = await openDialog(user, 'Dodaj nowe miejsce', 'Dodawanie nowego miejsca');
        await user.type(within(dialog).getByLabelText('Kod pocztowy'), krakow.postal);
        await user.type(within(dialog).getByLabelText('Nazwa miejscowości'), krakow.name);
        await browserUser.keyboard('{Enter}');

        await expect.poll(() => dialog).not.toBeInTheDocument();
        await settle();
        expect(createCity).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('creates the Customer once on Enter in its Tax Number, not saving the Order behind it', async () => {
        vi.mocked(createCustomer).mockResolvedValueOnce(writeResponse.succeeded(nowaFirma));
        const { user } = await setup();
        await fillInNewOrder(user);

        const dialog = await openDialog(
          user,
          'Dodaj nowego zleceniodawcę',
          'Dodawanie nowego zleceniodawcy',
        );
        await user.type(within(dialog).getByLabelText('Nazwa zleceniodawcy'), nowaFirma.name);
        await user.type(within(dialog).getByLabelText('NIP'), nowaFirma.tax);
        await browserUser.keyboard('{Enter}');

        await expect.poll(() => dialog).not.toBeInTheDocument();
        await settle();
        expect(createCustomer).toHaveBeenCalledOnce();
        expect(screen.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
        expect(createOrder).not.toHaveBeenCalled();
      });

      it('offers no new City when the create is refused', async () => {
        vi.mocked(createCity).mockResolvedValueOnce(writeResponse.refused('CityTaken'));
        const { user } = await setup();

        await createCityInDialog(user);

        await screen.findByText('Ta miejscowość już istnieje.');
        expect(await placeChoices(user, 'Miejsca załadunku')).toEqual(['Płock']);
        expect(await placeChoices(user, 'Miejsca rozładunku')).toEqual(['Płock']);
      });
    });

    it('saves the Order once on Enter in its Order Number', async () => {
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByLabelText('Numer zlecenia'));
      await browserUser.keyboard('{Enter}');

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({ orderNr: 'ZL-12' }),
      );
    });

    it('sends one Order while it is being saved, however often Zapisz is clicked', async () => {
      const save = deferred();
      vi.mocked(createOrder).mockReturnValueOnce(
        save.promise.then(() => writeResponse.succeeded()),
      );
      const { user } = await setup();

      await fillInNewOrder(user);
      await user.dblClick(screen.getByRole('button', { name: 'Zapisz' }));

      const sending = await screen.findByRole('button', { name: 'Wysyłanie' });
      expect(sending).toBeDisabled();
      await user.click(sending);
      expect(createOrder).toHaveBeenCalledOnce();

      await act(async () => save.resolve());
    });

    it('submits a new non-PLN Order without an Exchange Rate, which the Orders module works out', async () => {
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByLabelText('Waluta'));
      await user.click(await screen.findByRole('option', { name: 'EUR' }));
      await screen.findByText('Tabela nr 107/NBP/A z dnia 2021-01-15, 1 EUR = 4.25 PLN');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({ currencyId: 2 }));
      expect(vi.mocked(createOrder).mock.calls[0]?.[0]).not.toHaveProperty('currencyInfo');
    });

    it('marks the Currency field invalid and blocks saving when NBP fails', async () => {
      failNbp();
      const { user } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByLabelText('Waluta'));
      await user.click(await screen.findByRole('option', { name: 'EUR' }));
      await screen.findByText('Nie udało się pobrać kursu walut.');

      expect(screen.getByLabelText('Waluta')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('button', { name: 'Zapisz' })).toBeDisabled();
    });

    it('does not save on Enter when NBP fails, as the disabled Zapisz does not', async () => {
      failNbp();
      const { user } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByLabelText('Waluta'));
      await user.click(await screen.findByRole('option', { name: 'EUR' }));
      await screen.findByText('Nie udało się pobrać kursu walut.');
      await user.click(screen.getByLabelText('Numer zlecenia'));
      await browserUser.keyboard('{Enter}');

      await settle();
      expect(createOrder).not.toHaveBeenCalled();
    });

    it("saves a EUR Order unloading after the new year's holiday with the rate from before it", async () => {
      // Wednesday 2027-01-20 12:00 in Warsaw, so the date pickers show January 2027.
      vi.setSystemTime(new Date('2027-01-20T11:00:00Z'));
      worker.use(
        nbpApiServing([
          { no: '002/A/NBP/2027', mid: 4.24, effectiveDate: '2027-01-05' },
          { no: '003/A/NBP/2027', mid: 4.25, effectiveDate: '2027-01-07' },
        ]),
      );
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await pickDate(user, 'Data rozładunku', 7);
      await pickDate(user, 'Data załadunku', 5);
      await user.click(screen.getByLabelText('Waluta'));
      await user.click(await screen.findByRole('option', { name: 'EUR' }));
      // 6 January (Epiphany) is a holiday.
      await screen.findByText('Tabela nr 002/A/NBP/2027 z dnia 2027-01-05, 1 EUR = 4.24 PLN');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: '2027-01-07',
          currencyId: 2,
        }),
      );
    });

    it('keeps showing a Customer found by searching once the search no longer returns them', async () => {
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      const customerField = screen.getByLabelText('Zleceniodawca');
      await user.clear(customerField);
      await user.type(customerField, 'ANG');
      await user.click(await screen.findByRole('option', { name: 'ANGEL' }));

      // Picking types ANGEL into the search, which the stub answers with no one.
      await vi.waitFor(() => expect(searchCustomers).toHaveBeenLastCalledWith('ANGEL'));
      await expect.poll(() => customerField).toHaveValue('ANGEL');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));
      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledWith(expect.objectContaining({ customerId: angel.id }));
    });

    it('searches Cities by name and picks one beyond the preloaded ones', async () => {
      const zgierz = { ...plock, id: 11, name: 'Zgierz', postal: '95-100' };
      vi.mocked(searchCities).mockResolvedValue([zgierz]);
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.type(screen.getByLabelText('Miejsca rozładunku'), 'Zgi');
      await user.click(await screen.findByRole('option', { name: 'Zgierz' }));
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(searchCities).toHaveBeenCalledWith('Zgi');
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          loadingPlaces: [plock.id],
          unloadingPlaces: [plock.id, zgierz.id],
        }),
      );
    });

    it("shows a searched City's Country on its picked Place", async () => {
      vi.mocked(searchCities).mockResolvedValue([berlin]);
      const { user } = await setup();

      await user.type(screen.getByLabelText('Miejsca rozładunku'), 'Ber');
      await user.click(await screen.findByRole('option', { name: 'Berlin' }));

      expect(screen.getByText('DE')).toBeVisible();
    });

    it('opens dated today and tomorrow in Warsaw, read each time it opens', async () => {
      // Monday 2026-11-02 00:30 in Warsaw, still Sunday in UTC and Los Angeles.
      vi.setSystemTime(new Date('2026-11-01T23:30:00Z'));
      const { unmount } = await setup();

      expect(screen.getByLabelText('Data załadunku')).toHaveTextContent('2026-11-02');
      expect(screen.getByLabelText('Data rozładunku')).toHaveTextContent('2026-11-03');

      unmount();
      vi.setSystemTime(new Date('2026-11-02T23:30:00Z'));
      await setup();

      expect(screen.getByLabelText('Data załadunku')).toHaveTextContent('2026-11-03');
      expect(screen.getByLabelText('Data rozładunku')).toHaveTextContent('2026-11-04');
    });

    it('closes the calendar once a day is picked', async () => {
      const { user } = await setup();

      await pickDate(user, 'Data rozładunku', 20);

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });

    it("opens each date's calendar on its month, the Unloading Date's next month on a month's last day", async () => {
      // Saturday 2026-10-31 12:00 in Warsaw, so the form opens dated 31 October and 1 November.
      vi.setSystemTime(new Date('2026-10-31T11:00:00Z'));
      const { user } = await setup();

      expect(await calendarMonth(user, 'Data załadunku')).toBe('październik 2026');
      expect(await calendarMonth(user, 'Data rozładunku')).toBe('listopad 2026');
    });

    it('keeps each date when its picked day is clicked again', async () => {
      // Thursday 2026-11-12 12:00 in Warsaw, so the form opens dated 12 and 13 November.
      vi.setSystemTime(new Date('2026-11-12T11:00:00Z'));
      const { user } = await setup();

      await pickDate(user, 'Data załadunku', 12);
      await pickDate(user, 'Data rozładunku', 13);

      expect(screen.getByLabelText('Data załadunku')).toHaveTextContent('2026-11-12');
      expect(screen.getByLabelText('Data rozładunku')).toHaveTextContent('2026-11-13');
    });

    it('leaves the Driver empty when the picked Truck has no Regular Driver', async () => {
      const { user } = await setup();

      await user.click(screen.getByLabelText('Pojazd'));
      await user.click(screen.getByRole('option', { name: 'WPL1234A' }));

      expect(screen.getByLabelText('Kierowca')).toHaveValue('');
    });

    it('keeps the picked Driver when the picked Truck has no Regular Driver', async () => {
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByLabelText('Kierowca'));
      await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));
      await user.click(screen.getByLabelText('Pojazd'));
      await user.click(screen.getByRole('option', { name: 'WPL1234A' }));

      expect(screen.getByLabelText('Kierowca')).toHaveValue('Adam Nowak');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));
      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(createOrder).toHaveBeenCalledWith(
        expect.objectContaining({ truckId: 2, driverId: 2 }),
      );
    });

    it('refuses to save without a Truck or a Driver, saying which is missing', async () => {
      const { user } = await setup();

      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await screen.findByText('Wybierz pojazd.');
      expect(screen.getByText('Wybierz kierowcę.')).toBeVisible();
      expect(screen.getByLabelText('Pojazd')).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText('Kierowca')).toHaveAttribute('aria-invalid', 'true');
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('does not submit when the Loading Date is after the Unloading Date', async () => {
      const { user } = await setup();

      await pickDate(user, 'Data rozładunku', 12);
      await pickDate(user, 'Data załadunku', 13);
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await screen.findByText('Data załadunku nie może być późniejsza niż data rozładunku.');
      expect(createOrder).not.toHaveBeenCalled();
    });

    it('does not submit an empty Order', async () => {
      const { user } = await setup();

      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      expect(createOrder).not.toHaveBeenCalled();
    });

    it('resets to the values it opened with', async () => {
      const { user } = await setup();

      await user.type(screen.getByLabelText('Numer zlecenia'), 'ZL-12');
      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(screen.getByLabelText('Numer zlecenia')).toHaveValue('');
    });
  });

  describe('edit', () => {
    const orderFields = {
      id: 7,
      orderNr: 'ZL-7',
      startDate: '2026-11-12',
      endDate: '2026-11-13',
      driver: choices.drivers[1],
    };
    const order = orderReadModel(orderFields);
    const editSetup = (edited: OrderReadModel = order) =>
      setup({ order: edited, action: (input) => updateOrder(edited.id, input) });

    beforeEach(() => {
      vi.mocked(updateOrder).mockResolvedValue(writeResponse.succeeded());
    });

    it("opens each date's calendar on its month, not the current one", async () => {
      const { user } = await editSetup(
        orderReadModel({ ...orderFields, startDate: '2026-09-30', endDate: '2026-10-01' }),
      );
      await user.click(screen.getByRole('button', { name: 'Edytuj' }));

      expect(await calendarMonth(user, 'Data załadunku')).toBe('wrzesień 2026');
      expect(await calendarMonth(user, 'Data rozładunku')).toBe('październik 2026');
    });

    it('starts locked on the Order and submits the changed Order under its id', async () => {
      const { user, onDialogClose } = await editSetup();

      const price = screen.getByLabelText('Cena w walucie');
      expect(price).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.clear(price);
      await user.type(price, '2500');

      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(updateOrder).toHaveBeenCalledExactlyOnceWith(7, {
        orderNr: 'ZL-7',
        startDate: '2026-11-12',
        endDate: '2026-11-13',
        customerId: 1,
        driverId: 2,
        truckId: 1,
        statusId: 1,
        priceCurrency: '2500',
        currencyId: 1,
        loadingPlaces: [plock.id],
        unloadingPlaces: [plock.id],
      });
    });

    it('unlocks on Edytuj without saving the Order', async () => {
      const { onDialogClose } = await editSetup();

      // The browser's own click, whose activation a submit button left in Edytuj's place would run.
      await browserUser.click(screen.getByRole('button', { name: 'Edytuj' }));

      expect(screen.getByLabelText('Cena w walucie')).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
      expect(updateOrder).not.toHaveBeenCalled();
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    it('restores the values it opened with on Reset and locks again', async () => {
      const { user } = await editSetup();

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      const price = screen.getByLabelText('Cena w walucie');
      await user.clear(price);
      await user.type(price, '2500');
      await user.click(screen.getByRole('button', { name: 'Reset' }));

      expect(price).toHaveValue(1000);
      expect(price).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Edytuj' })).toBeVisible();
      expect(screen.queryByRole('button', { name: 'Zapisz' })).toBeNull();
    });

    it('stays editable with what the user entered when the save is refused', async () => {
      vi.mocked(updateOrder).mockResolvedValueOnce(writeResponse.refused('UnknownTruck'));
      const { user, onDialogClose } = await editSetup();

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      const price = screen.getByLabelText('Cena w walucie');
      await user.clear(price);
      await user.type(price, '2500');
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await expect.poll(() => screen.queryByText('Wybrany pojazd nie istnieje.')).toBeVisible();
      expect(price).toHaveValue(2500);
      expect(price).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Zapisz' })).toBeEnabled();
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    it('saves the changed Order once on Enter in its Price', async () => {
      const { user, onDialogClose } = await editSetup();

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      const price = screen.getByLabelText('Cena w walucie');
      await user.clear(price);
      await user.type(price, '2500');
      await browserUser.keyboard('{Enter}');

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(updateOrder).toHaveBeenCalledExactlyOnceWith(
        7,
        expect.objectContaining({ priceCurrency: '2500' }),
      );
    });

    it('offers a City created from it ahead of its saved Places beyond the preloaded ones', async () => {
      vi.mocked(createCity).mockResolvedValueOnce(writeResponse.succeeded(krakow));
      const { user } = await editSetup({ ...order, unloadingPlaces: [berlin] });
      await user.click(screen.getByRole('button', { name: 'Edytuj' }));

      const dialog = await createCityInDialog(user);

      await expect.poll(() => dialog).not.toBeInTheDocument();
      expect(await placeChoices(user, 'Miejsca rozładunku')).toEqual(['Kraków', 'Berlin', 'Płock']);
    });

    it('removes a picked Unloading Place by its named button', async () => {
      const zgierz = { ...plock, id: 11, name: 'Zgierz', postal: '95-100' };
      const { user, onDialogClose } = await editSetup({
        ...order,
        loadingPlaces: [zgierz],
        unloadingPlaces: [plock, zgierz],
      });

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByRole('button', { name: 'Usuń Płock' }));
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(updateOrder).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ loadingPlaces: [zgierz.id], unloadingPlaces: [zgierz.id] }),
      );
    });

    it('shows its Customer beyond the preloaded ones, offering the preloaded Customers', async () => {
      const { user, onDialogClose } = await editSetup({ ...order, customer: angel });

      expect(screen.getByLabelText('Zleceniodawca')).toHaveValue('ANGEL');
      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByLabelText('Zleceniodawca'));
      await user.click(await screen.findByRole('option', { name: 'DEVIL' }));
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(updateOrder).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ customerId: customer.id }),
      );
    });

    it('lists its Customer beyond the preloaded ones first in the open list, as picked', async () => {
      const { user } = await editSetup({ ...order, customer: angel });

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByLabelText('Zleceniodawca'));

      const options = await screen.findAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual(['ANGEL', 'DEVIL']);
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it.each([
      ['Miejsca załadunku', { loadingPlaces: [berlin] }],
      ['Miejsca rozładunku', { unloadingPlaces: [berlin] }],
    ])('lists its City beyond the preloaded ones first in the open %s list, as picked', async (label, places) => {
      const { user } = await editSetup({ ...order, ...places });

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByLabelText(label));

      const options = await screen.findAllByRole('option');
      expect(options.map((option) => option.textContent)).toEqual(['Berlin', 'Płock']);
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('shows its Customer, Truck and Driver', async () => {
      await editSetup();

      expect(screen.getByLabelText('Zleceniodawca')).toHaveValue('DEVIL');
      expect(screen.getByLabelText('Pojazd')).toHaveValue('WND0997C');
      expect(screen.getByLabelText('Kierowca')).toHaveValue('Adam Nowak');
    });

    it('shows its Truck and Driver beyond the choices, saving them unchanged', async () => {
      const truck = {
        id: 30,
        plate: 'WGM5555X',
        insuranceEndAt: '2027-06-01',
        serviceEndAt: '2027-06-01',
        driverId: null,
      };
      const driver = { id: 31, firstName: 'Ewa', lastName: 'Zielińska' };
      const { user, onDialogClose } = await editSetup(
        orderReadModel({ ...orderFields, truck, driver }),
      );

      expect(screen.getByLabelText('Pojazd')).toHaveValue('WGM5555X');
      expect(screen.getByLabelText('Kierowca')).toHaveValue('Ewa Zielińska');
      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
      expect(updateOrder).toHaveBeenCalledWith(
        7,
        expect.objectContaining({ truckId: 30, driverId: 31 }),
      );
    });

    it("shows the Order's Places with their Cities' Countries", async () => {
      await editSetup({ ...order, unloadingPlaces: [berlin] });

      expect(screen.getByText('DE')).toBeVisible();
    });

    it("defaults the Driver to the picked Truck's Regular Driver", async () => {
      const { user } = await editSetup({ ...order, truck: choices.trucks[1] });

      await user.click(screen.getByRole('button', { name: 'Edytuj' }));
      await user.click(screen.getByLabelText('Pojazd'));
      await user.click(screen.getByRole('option', { name: 'WND0997C' }));
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() =>
        expect(updateOrder).toHaveBeenCalledWith(
          7,
          expect.objectContaining({ truckId: 1, driverId: 1 }),
        ),
      );
    });

    describe('a EUR Order', () => {
      const eurOrder = orderReadModel({
        ...orderFields,
        currency: { id: 2, code: 'EUR' },
        exchangeRate: '4.2000',
        exchangeDate: '2026-10-29',
      });

      /** NBP has an Exchange Rate for EUR only. */
      const nbpHasEurRateOnly = () =>
        worker.use(
          http.get(NBP_RATES_URL, ({ params }) =>
            params.code === 'EUR'
              ? HttpResponse.json({
                  rates: [{ no: '211/A/NBP/2026', mid: 4.25, effectiveDate: '2026-10-30' }],
                })
              : HttpResponse.json({}, { status: 404 }),
          ),
        );

      it('starts with its stored Exchange Rate, rate date and PLN Price', async () => {
        failNbp();
        await editSetup(eurOrder);

        expect(screen.getByText('Kurs z dnia 2026-10-29, 1 EUR = 4.2 PLN')).toBeInTheDocument();
        expect(screen.getByText('Cena w PLN: 4200.00')).toBeInTheDocument();
      });

      it('saves with its stored Exchange Rate while NBP is down', async () => {
        failNbp();
        const { user, onDialogClose } = await editSetup(eurOrder);

        await user.click(screen.getByRole('button', { name: 'Edytuj' }));
        await user.clear(screen.getByLabelText('Cena w walucie'));
        await user.type(screen.getByLabelText('Cena w walucie'), '2000');
        expect(screen.getByText('Cena w PLN: 8400.00')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));

        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(updateOrder).toHaveBeenCalledWith(
          7,
          expect.objectContaining({
            priceCurrency: '2000',
            currencyId: 2,
          }),
        );
      });

      it('keeps its stored Exchange Rate again when the Unloading Date changes back', async () => {
        failNbp();
        const { user, onDialogClose } = await editSetup(eurOrder);

        await user.click(screen.getByRole('button', { name: 'Edytuj' }));
        await pickDate(user, 'Data rozładunku', 20);
        await screen.findByText('Nie udało się pobrać kursu walut.');
        await pickDate(user, 'Data rozładunku', 13);
        await screen.findByText('Kurs z dnia 2026-10-29, 1 EUR = 4.2 PLN');
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));

        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(updateOrder).toHaveBeenCalledWith(
          7,
          expect.objectContaining({ endDate: '2026-11-13' }),
        );
      });

      it('fetches a new Exchange Rate when its Unloading Date changes', async () => {
        nbpHasEurRateOnly();
        const { user, onDialogClose } = await editSetup(eurOrder);

        await user.click(screen.getByRole('button', { name: 'Edytuj' }));
        await pickDate(user, 'Data rozładunku', 20);
        await screen.findByText('Tabela nr 211/A/NBP/2026 z dnia 2026-10-30, 1 EUR = 4.25 PLN');
        expect(screen.getByText('Cena w PLN: 4250.00')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));

        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(updateOrder).toHaveBeenCalledWith(
          7,
          expect.objectContaining({
            endDate: '2026-11-20',
          }),
        );
      });

      it('drops its Exchange Rate and blocks saving when the new Currency has none', async () => {
        nbpHasEurRateOnly();
        const { user } = await editSetup(eurOrder);

        await user.click(screen.getByRole('button', { name: 'Edytuj' }));
        await user.click(screen.getByLabelText('Waluta'));
        await user.click(await screen.findByRole('option', { name: 'USD' }));
        await screen.findByText('Nie znaleziono kursu dla wskazanej daty.');

        expect(screen.queryByText(/1 (EUR|USD) =/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Cena w PLN/)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Zapisz' })).toBeDisabled();
      });
    });
  });
});
