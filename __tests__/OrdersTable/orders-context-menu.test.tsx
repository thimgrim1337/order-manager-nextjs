import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersContextMenu from '@/features/OrdersTable/components/OrdersContextMenu/context-menu';
import { deleteOrder, patchOrder } from '@/lib/actions';
import type { Order } from '@/types/types';

// The Edit dialog's form imports the customer and city actions too.
vi.mock('@/lib/actions', () => ({
  patchOrder: vi.fn(),
  deleteOrder: vi.fn(),
  updateOrder: vi.fn(),
  searchCustomers: vi.fn(),
  createCity: vi.fn(),
  createCustomer: vi.fn(),
}));

const order = {
  id: 1,
  orderNr: 'ZL-001',
  status: { id: 1, name: 'pending' },
} as unknown as Order;

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
});

const setup = () => {
  const user = userEvent.setup();
  render(
    <OrdersContextMenu order={order}>
      <div>ZL-001 row</div>
    </OrdersContextMenu>,
  );
  return { user };
};

describe('OrdersContextMenu', () => {
  it('keeps the Status dialog closed when Escape is pressed before the save finishes', async () => {
    const save = deferred();
    vi.mocked(patchOrder).mockReturnValueOnce(
      save.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof patchOrder>,
    );
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Status' }));
    await user.click(await screen.findByRole('button', { name: 'status-delivered' }));
    await user.keyboard('{Escape}');

    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Zmiana statusu zlecenia' }))
      .toBeNull();

    await act(async () => save.resolve());

    expect(screen.queryByRole('heading', { name: 'Zmiana statusu zlecenia' })).toBeNull();
  });

  it('keeps the Remove dialog closed when Escape is pressed before the delete finishes', async () => {
    const remove = deferred();
    vi.mocked(deleteOrder).mockReturnValueOnce(
      remove.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof deleteOrder>,
    );
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    await user.click(await screen.findByRole('button', { name: 'Usuń' }));
    await user.keyboard('{Escape}');

    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Czy jesteś pewny ?' }))
      .toBeNull();

    await act(async () => remove.resolve());

    expect(screen.queryByRole('heading', { name: 'Czy jesteś pewny ?' })).toBeNull();
  });
});
