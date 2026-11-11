import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersTable from '@/features/OrdersTable/components/orders-table';
import { orderReadModel } from '../fixtures/order-read-model';

const replaceMock = vi.hoisted(() => vi.fn());
const search = vi.hoisted(() => ({ current: '' }));

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(search.current),
  usePathname: () => '/orders',
  useRouter: () => ({ replace: replaceMock }),
}));

const order = orderReadModel();

beforeEach(() => {
  replaceMock.mockReset();
});

function renderAt(url: string) {
  search.current = url;
  render(<OrdersTable orders={[order]} count={1} />);
  // Forget a navigation an earlier test left pending: the URL is the one rendered here.
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  return userEvent.setup();
}

function sortInUrl() {
  return new URL(replaceMock.mock.lastCall?.[0], window.location.origin).searchParams.get('sort');
}

describe('OrdersTable sorting', () => {
  it("sorts by a column's field when its header is clicked", async () => {
    const user = renderAt('');

    await user.click(screen.getByRole('button', { name: 'Kierowca' }));

    expect(sortInUrl()).toBe('driverFullname.asc');
  });

  it('flips the direction when the sorted column’s header is clicked again', async () => {
    const user = renderAt('sort=driverFullname.asc');

    await user.click(screen.getByRole('button', { name: 'Kierowca' }));

    expect(sortInUrl()).toBe('driverFullname.desc');
  });

  it('flips the default newest-first Start Date sort to oldest first', async () => {
    const user = renderAt('');

    await user.click(screen.getByRole('button', { name: 'Data załadunku' }));

    expect(sortInUrl()).toBe('startDate.asc');
  });
});
