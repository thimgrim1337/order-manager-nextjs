import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TimelineOrder from '@/features/OrdersTimeline/components/timeline-order';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { updateOrder } from '@/lib/actions';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { orderChoices } from '../utils/order-choices';
import { week } from '../utils/week';
import { renderWithQueries } from '../utils/wrapper';
import { writeResponse } from '../utils/write-response';

const w44 = week('2026-W44');
const poland: CountryReadModel = { id: 1, name: 'Poland', code: 'PL' };
const germany: CountryReadModel = { id: 2, name: 'Germany', code: 'DE' };
const warszawa = {
  id: 1,
  name: 'Warszawa',
  postal: '00-001',
  countryId: poland.id,
  country: poland,
};
const berlin = { id: 2, name: 'Berlin', postal: '10115', countryId: germany.id, country: germany };

/** Order 1's colour on the Timeline. */
const orderColor = 'border-chart-2';

const order = (dates: { startDate: string; endDate: string }) =>
  ({
    id: 1,
    orderNr: 'ZL/1',
    ...dates,
    status: { id: 1, name: 'w trakcie' },
    customer: { id: 1, name: 'DEVIL', tax: '7743241555' },
    driver: { id: 1, firstName: 'Jan', lastName: 'Kowalski' },
    truck: { id: 1, plate: 'WND0997C' },
    loadingPlaces: [warszawa],
    unloadingPlaces: [berlin],
  }) as unknown as OrderReadModel;

/** The row's seven day cells, Monday first. */
function renderRow(dates: { startDate: string; endDate: string }) {
  const theOrder = order(dates);
  render(
    <table>
      <tbody>
        <TimelineOrder week={w44} order={theOrder} />
      </tbody>
    </table>,
  );
  return screen.getAllByRole('cell').slice(1);
}

const continuesFromPreviousWeek = 'Ciąg dalszy z poprzedniego tygodnia';
const continuesIntoNextWeek = 'Ciąg dalszy w następnym tygodniu';

const markLabels = [continuesFromPreviousWeek, continuesIntoNextWeek];

const imgLabels = (cell: HTMLElement) =>
  within(cell)
    .queryAllByRole('img')
    .map((img) => img.getAttribute('aria-label') ?? '');

const marks = (cell: HTMLElement) => imgLabels(cell).filter((label) => markLabels.includes(label));

const flags = (cell: HTMLElement) => imgLabels(cell).filter((label) => !markLabels.includes(label));

describe('Timeline row', () => {
  it('shows the loading day with its Place, flag and Customer, transit days, and the unloading day with its Place and flag', () => {
    const [monday, tuesday, wednesday, thursday, friday, saturday, sunday] = renderRow({
      startDate: '2026-10-27',
      endDate: '2026-10-30',
    });

    expect(monday).toHaveTextContent(/^$/);
    expect(tuesday).toHaveTextContent('WarszawaDEVIL');
    expect(flags(tuesday as HTMLElement)).toEqual(['PL']);
    expect(wednesday).toHaveTextContent(/^$/);
    expect(wednesday).toHaveClass(orderColor);
    expect(thursday).toHaveClass(orderColor);
    expect(friday).toHaveTextContent('Berlin');
    expect(friday).not.toHaveTextContent('DEVIL');
    expect(flags(friday as HTMLElement)).toEqual(['DE']);
    expect(saturday).not.toHaveClass(orderColor);
    expect(sunday).toHaveTextContent(/^$/);
  });

  it('shows both Places, with flags, and the Customer when loading and unloading fall on the same day', () => {
    const cells = renderRow({ startDate: '2026-10-28', endDate: '2026-10-28' });

    expect(cells[2]).toHaveTextContent('Warszawa→BerlinDEVIL');
    expect(flags(cells[2] as HTMLElement)).toEqual(['PL', 'DE']);
  });

  it('shows, for an Order crossing both edges of the Week, where it came from on Monday and where it goes on Sunday', () => {
    const cells = renderRow({ startDate: '2026-10-20', endDate: '2026-11-05' });

    expect(cells[0]).toHaveTextContent(/^Warszawa$/);
    expect(cells.slice(1, 6).map((cell) => cell.textContent)).toEqual(Array(5).fill(''));
    expect(cells[6]).toHaveTextContent(/^Berlin$/);
    expect(cells.flatMap(flags)).toEqual([]);
    expect(cells.every((cell) => cell.classList.contains(orderColor))).toBe(true);
  });

  it('marks Monday as continuing from the previous Week and Sunday as continuing into the next', () => {
    const cells = renderRow({ startDate: '2026-10-20', endDate: '2026-11-05' });

    expect(marks(cells[0] as HTMLElement)).toEqual([continuesFromPreviousWeek]);
    expect(cells.slice(1, 6).flatMap(marks)).toEqual([]);
    expect(marks(cells[6] as HTMLElement)).toEqual([continuesIntoNextWeek]);
  });

  it('marks an unloading Monday as continuing from the previous Week', () => {
    const cells = renderRow({ startDate: '2026-10-22', endDate: '2026-10-26' });

    expect(marks(cells[0] as HTMLElement)).toEqual([continuesFromPreviousWeek]);
  });

  it('marks a loading Sunday as continuing into the next Week', () => {
    const cells = renderRow({ startDate: '2026-11-01', endDate: '2026-11-03' });

    expect(marks(cells[6] as HTMLElement)).toEqual([continuesIntoNextWeek]);
  });

  it('marks nothing for an Order inside the Week', () => {
    const cells = renderRow({ startDate: '2026-10-26', endDate: '2026-11-01' });

    expect(cells.flatMap(marks)).toEqual([]);
  });
});

describe('Timeline row edit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the edit-Order dialog on click and saves the changed Order under its id', async () => {
    vi.mocked(updateOrder).mockResolvedValueOnce(writeResponse.succeeded());
    const choices = orderChoices();
    const [plock] = choices.cities;
    const edited = {
      ...order({ startDate: '2026-10-27', endDate: '2026-10-30' }),
      customer: choices.customers[0],
      driver: choices.drivers[0],
      truck: choices.trucks[0],
      currency: { ...choices.currencies[0], rate: 1, date: '' },
      priceCurrency: '1000',
      pricePLN: '1000',
      loadingPlaces: [plock],
      unloadingPlaces: [plock],
    } as OrderReadModel;
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await renderWithQueries(
      <OrderChoicesProvider choices={choices}>
        <table>
          <tbody>
            <TimelineOrder week={w44} order={edited} />
          </tbody>
        </table>
      </OrderChoicesProvider>,
    );

    await user.click(screen.getByRole('row'));
    expect(await screen.findByRole('heading', { name: 'Edycja zlecenia ZL/1' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Edytuj' }));
    const price = screen.getByLabelText('Cena w walucie');
    await user.clear(price);
    await user.type(price, '2500');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));

    await vi.waitFor(() =>
      expect(updateOrder).toHaveBeenCalledExactlyOnceWith(
        1,
        expect.objectContaining({ orderNr: 'ZL/1', priceCurrency: '2500' }),
      ),
    );
    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Edycja zlecenia ZL/1' }))
      .toBeNull();
  });
});
