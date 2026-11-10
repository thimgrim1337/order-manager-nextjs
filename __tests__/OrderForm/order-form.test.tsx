import { act, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrderForm, { type OrderFormProps } from '@/features/OrderForm/components/order-form';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { createOrder, searchCities, searchCustomers, updateOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { worker } from '../mocks/browser';
import { NBP_RATES_URL, nbpApiServing } from '../mocks/handlers';
import { deferred } from '../utils/deferred';
import { orderChoices } from '../utils/order-choices';
import { pickDate } from '../utils/pick-date';
import { place } from '../utils/place';
import { renderWithQueries } from '../utils/wrapper';

const choices = orderChoices();
const [plock] = choices.cities;
const [customer] = choices.customers;

/** NBP answers with a server error. */
const failNbp = () =>
  worker.use(http.get(NBP_RATES_URL, () => HttpResponse.json({}, { status: 500 })));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(searchCustomers).mockResolvedValue([customer]);
  vi.mocked(createOrder).mockResolvedValue({ success: true, data: {} } as Awaited<
    ReturnType<typeof createOrder>
  >);
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

    it('keeps the dialog open when the Order is not saved', async () => {
      vi.mocked(createOrder).mockResolvedValueOnce({
        success: false,
        message: 'Numer zlecenia jest już zajęty.',
      });
      const { user, onDialogClose } = await setup();

      await fillInNewOrder(user);
      await user.click(screen.getByRole('button', { name: 'Zapisz' }));

      await vi.waitFor(() => expect(createOrder).toHaveBeenCalledOnce());
      expect(onDialogClose).not.toHaveBeenCalled();
    });

    it('sends one Order while it is being saved, however often Zapisz is clicked', async () => {
      const save = deferred();
      vi.mocked(createOrder).mockReturnValueOnce(
        save.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof createOrder>,
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

    it('searches Cities by name and picks one beyond the preloaded ones', async () => {
      const zgierz = { id: 11, name: 'Zgierz', postal: '95-100', countryId: 1 };
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

    it('leaves the Driver empty when the picked Truck has no Regular Driver', async () => {
      const { user } = await setup();

      await user.click(screen.getByLabelText('Pojazd'));
      await user.click(screen.getByRole('option', { name: 'WPL1234A' }));

      expect(screen.getByLabelText('Kierowca')).toHaveValue('');
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
    // The Order's Places carry their Country, as the Order read model gives them.
    const [poland] = choices.countries;
    const plockPlace = place(plock, poland);
    const order: OrderReadModel = {
      id: 7,
      orderNr: 'ZL-7',
      startDate: '2026-11-12',
      endDate: '2026-11-13',
      customer,
      driver: choices.drivers[1],
      truck: choices.trucks[0],
      status: { id: 1, name: 'w trakcie' },
      currency: { ...choices.currencies[0], rate: 1, date: '' },
      priceCurrency: '1000',
      pricePLN: '1000',
      loadingPlaces: [plockPlace],
      unloadingPlaces: [plockPlace],
    };
    const editSetup = (edited: OrderReadModel = order) =>
      setup({ order: edited, action: (input) => updateOrder(edited.id, input) });

    beforeEach(() => {
      vi.mocked(updateOrder).mockResolvedValue({ success: true, data: {} } as Awaited<
        ReturnType<typeof updateOrder>
      >);
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
        loadingPlaces: [plockPlace.id],
        unloadingPlaces: [plockPlace.id],
      });
    });

    it('removes a picked Unloading Place by its named button', async () => {
      const zgierz = place(
        { id: 11, name: 'Zgierz', postal: '95-100', countryId: poland.id },
        poland,
      );
      const { user, onDialogClose } = await editSetup({
        ...order,
        loadingPlaces: [zgierz],
        unloadingPlaces: [plockPlace, zgierz],
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
      const eurOrder: OrderReadModel = {
        ...order,
        currency: { id: 2, code: 'EUR', rate: 4.2, date: '2026-10-29' },
        priceCurrency: '1000',
        pricePLN: '4200.00',
      };

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

      it('fetches a new Exchange Rate when its Currency changes', async () => {
        nbpHasEurRateOnly();
        const { user, onDialogClose } = await editSetup({
          ...eurOrder,
          currency: { id: 3, code: 'USD', rate: 3.6, date: '2026-10-29' },
        });

        await user.click(screen.getByRole('button', { name: 'Edytuj' }));
        await user.click(screen.getByLabelText('Waluta'));
        await user.click(await screen.findByRole('option', { name: 'EUR' }));
        await screen.findByText('Tabela nr 211/A/NBP/2026 z dnia 2026-10-30, 1 EUR = 4.25 PLN');
        expect(screen.getByText('Cena w PLN: 4250.00')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Zapisz' }));

        await vi.waitFor(() => expect(onDialogClose).toHaveBeenCalled());
        expect(updateOrder).toHaveBeenCalledWith(
          7,
          expect.objectContaining({
            currencyId: 2,
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
