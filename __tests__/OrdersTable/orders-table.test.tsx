import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import OrdersSearch from '@/features/OrdersTable/components/OrdersFilter/orders-search';
import OrdersTable from '@/features/OrdersTable/components/orders-table';
import { orderReadModel } from '../fixtures/order-read-model';
import { holdNavigations, openUrl, renderedUrl } from '../utils/memory-url';

const order = orderReadModel();

// Past the Search input's debounce.
const TYPING_PAUSE = 700;

function renderAt(href: string) {
  openUrl(href);
  render(
    <>
      <OrdersSearch />
      <OrdersTable orders={[order]} count={1} />
    </>,
  );
  return userEvent.setup();
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
    await new Promise((resolve) => setTimeout(resolve, TYPING_PAUSE));
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
    await new Promise((resolve) => setTimeout(resolve, TYPING_PAUSE));
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
