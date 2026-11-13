import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import OrderTableFilter from '@/features/OrdersTable/components/OrdersFilter/orders-table-filter';
import OrdersTable from '@/features/OrdersTable/components/orders-table';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { orderReadModel } from '../fixtures/order-read-model';
import { holdNavigations, openUrl, renderedUrl } from '../utils/memory-url';
import { orderChoices } from '../utils/order-choices';
import { pickDate } from '../utils/pick-date';

const order = orderReadModel();
const choices = orderChoices();

// Past the Search input's debounce.
const TYPING_PAUSE = 700;

function waitTypingPause() {
  return new Promise((resolve) => setTimeout(resolve, TYPING_PAUSE));
}

function renderAt(href: string) {
  openUrl(href);
  render(
    <OrderChoicesProvider choices={choices}>
      <OrderTableFilter />
      <OrdersTable orders={[order]} count={1} />
    </OrderChoicesProvider>,
  );
  return userEvent.setup();
}

/** Renders the page at `href` with its filters unfolded. */
async function renderFiltersAt(href: string) {
  const user = renderAt(href);
  await user.click(screen.getByRole('button', { name: 'Filtrowanie' }));
  return user;
}

function urlParam(name: string) {
  return renderedUrl().searchParams.get(name);
}

function searchInput() {
  return screen.getByPlaceholderText('Szukaj zleceń....');
}

describe('OrdersTable sorting', () => {
  it("sorts by a column's field when its header is clicked", async () => {
    const user = renderAt('/orders');

    await user.click(screen.getByRole('button', { name: 'Kierowca' }));

    expect(urlParam('sort')).toBe('driverFullname.asc');
  });

  it('flips the direction when the sorted column’s header is clicked again', async () => {
    const user = renderAt('/orders?sort=driverFullname.asc');

    await user.click(screen.getByRole('button', { name: 'Kierowca' }));

    expect(urlParam('sort')).toBe('driverFullname.desc');
  });

  it('flips the default newest-first Start Date sort to oldest first', async () => {
    const user = renderAt('/orders');

    await user.click(screen.getByRole('button', { name: 'Data załadunku' }));

    expect(urlParam('sort')).toBe('startDate.asc');
  });

  it('flips a column clicked twice to descending', async () => {
    const user = renderAt('/orders');

    await user.click(screen.getByRole('button', { name: 'Kierowca' }));
    await user.click(screen.getByRole('button', { name: 'Kierowca' }));

    expect(urlParam('sort')).toBe('driverFullname.desc');
  });
});

describe('OrdersTable search', () => {
  it('puts a typed Search term in the URL once typing pauses, back on the first page', async () => {
    const user = renderAt('/orders?pageIndex=2');

    await user.type(searchInput(), 'Kraków');

    expect(urlParam('search')).toBeNull();
    await expect.poll(() => urlParam('search'), { timeout: TYPING_PAUSE }).toBe('Kraków');
    expect(urlParam('pageIndex')).toBeNull();
  });

  it('keeps characters typed while the earlier term is still navigating', async () => {
    const user = renderAt('/orders');
    const release = holdNavigations();

    await user.type(searchInput(), 'ab');
    await waitTypingPause();
    await user.type(searchInput(), 'c');
    act(release);

    expect(searchInput()).toHaveValue('abc');
    await expect.poll(() => urlParam('search'), { timeout: TYPING_PAUSE }).toBe('abc');
    expect(searchInput()).toHaveValue('abc');
  });

  it('keeps the space ending a term while its trimmed echo is navigating', async () => {
    const user = renderAt('/orders');
    const release = holdNavigations();

    await user.type(searchInput(), 'ab ');
    await waitTypingPause();
    await user.type(searchInput(), 'c');
    act(release);

    expect(searchInput()).toHaveValue('ab c');
    await expect.poll(() => urlParam('search'), { timeout: TYPING_PAUSE }).toBe('ab c');
  });

  it('shows the Search term already in the URL when the page opens', () => {
    renderAt('/orders?search=Krak%C3%B3w');

    expect(searchInput()).toHaveValue('Kraków');
  });

  it('removes the Search term from the URL when the input is cleared', async () => {
    const user = renderAt('/orders?search=Krak%C3%B3w');

    await user.clear(searchInput());

    await expect.poll(() => urlParam('search'), { timeout: TYPING_PAUSE }).toBeNull();
    expect(renderedUrl().pathname).toBe('/orders');
  });
});

describe('OrdersTable filters', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    // Monday 2026-11-02 12:00 in Warsaw, so the date filters' calendars show November 2026.
    vi.setSystemTime(new Date('2026-11-02T11:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('puts a picked Start date in the URL, back on the first page', async () => {
    const user = await renderFiltersAt('/orders?pageIndex=2');

    await pickDate(user, 'Data załadunku od', 12);

    expect(urlParam('startDate')).toBe('2026-11-12');
    expect(urlParam('pageIndex')).toBeNull();
  });

  it('puts a picked End date in the URL, back on the first page', async () => {
    const user = await renderFiltersAt('/orders?pageIndex=2');

    await pickDate(user, 'Data rozładunku do', 20);

    expect(urlParam('endDate')).toBe('2026-11-20');
    expect(urlParam('pageIndex')).toBeNull();
  });

  it('shows the Start and End dates the URL opened with', async () => {
    await renderFiltersAt('/orders?startDate=2026-09-15&endDate=2026-10-20');

    expect(screen.getByLabelText('Data załadunku od')).toHaveTextContent('2026-09-15');
    expect(screen.getByLabelText('Data rozładunku do')).toHaveTextContent('2026-10-20');
  });

  it('puts a picked Driver in the URL, back on the first page', async () => {
    const user = await renderFiltersAt('/orders?pageIndex=2');

    await user.click(screen.getByLabelText('Kierowca'));
    await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));

    expect(urlParam('driverId')).toBe('2');
    expect(urlParam('pageIndex')).toBeNull();
  });

  it('shows the Driver the URL opened with', async () => {
    await renderFiltersAt('/orders?driverId=2');

    expect(screen.getByLabelText('Kierowca')).toHaveValue('Adam Nowak');
  });

  it('puts a picked Status in the URL, back on the first page', async () => {
    const user = await renderFiltersAt('/orders?pageIndex=2');

    await user.click(screen.getByLabelText('Status zlecenia'));
    await user.click(screen.getByRole('option', { name: 'zakończone' }));

    expect(urlParam('statusId')).toBe('3');
    expect(urlParam('pageIndex')).toBeNull();
  });

  it('shows the Status the URL opened with', async () => {
    await renderFiltersAt('/orders?statusId=2');

    expect(screen.getByLabelText('Status zlecenia')).toHaveTextContent('anulowane');
  });

  it('keeps a Driver picked while the Status picked just before is still navigating', async () => {
    const user = await renderFiltersAt('/orders');
    const release = holdNavigations();

    await user.click(screen.getByLabelText('Status zlecenia'));
    await user.click(screen.getByRole('option', { name: 'zakończone' }));
    await user.click(screen.getByLabelText('Kierowca'));
    await user.click(screen.getByRole('option', { name: 'Adam Nowak' }));
    act(() => release({ lastOnly: true }));

    expect(urlParam('statusId')).toBe('3');
    expect(urlParam('driverId')).toBe('2');
  });
});

describe('OrdersTable reset', () => {
  it('drops a Search term still waiting on the typing pause', async () => {
    const user = renderAt('/orders');

    await user.type(searchInput(), 'Kraków');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitTypingPause();

    expect(searchInput()).toHaveValue('');
    expect(urlParam('search')).toBeNull();
  });

  it('drops a typed Search term with the one already in the URL', async () => {
    const user = renderAt('/orders?search=Gda');

    await user.type(searchInput(), 'nsk');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await waitTypingPause();

    expect(searchInput()).toHaveValue('');
    expect(urlParam('search')).toBeNull();
  });

  it('drops a sent Search term when only Reset’s navigation renders', async () => {
    const user = renderAt('/orders');
    const release = holdNavigations();

    await user.type(searchInput(), 'Kraków');
    await waitTypingPause();
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    act(() => release({ lastOnly: true }));

    expect(searchInput()).toHaveValue('');
    expect(urlParam('search')).toBeNull();
  });

  it('clears the filters, the sort and the page, keeping the page size', async () => {
    const user = renderAt(
      '/orders?search=Gda&startDate=2026-11-02&endDate=2026-11-08&driverId=3&statusId=1&sort=driverFullname.asc&pageIndex=2&pageSize=20',
    );

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(renderedUrl().search).toBe('?pageSize=20');
  });
});
