import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersContextMenu from '@/features/OrdersTable/components/OrdersContextMenu/context-menu';
import { changeOrderStatus, removeOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { renderWithToaster } from '../utils/render-with-toaster';

const order = {
  id: 1,
  orderNr: 'ZL-001',
  status: { id: 1, name: 'pending' },
} as unknown as OrderReadModel;

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
  renderWithToaster(
    <OrdersContextMenu order={order}>
      <div>ZL-001 row</div>
    </OrdersContextMenu>,
  );
  return { user };
};

describe('OrdersContextMenu', () => {
  it('keeps the Status dialog closed when Escape is pressed before the save finishes', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => ({ success: true, data: {} })) as ReturnType<
        typeof changeOrderStatus
      >,
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

  it('shows the failure in a toast and keeps the Status dialog open when the change fails', async () => {
    vi.mocked(changeOrderStatus).mockResolvedValueOnce({
      success: false,
      message: 'Zlecenie nie istnieje.',
    });
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Status' }));
    await user.click(await screen.findByRole('button', { name: 'status-delivered' }));

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Zmiana statusu zlecenia' })).toBeVisible();
  });

  it('confirms a changed Status in a toast and closes the Status dialog', async () => {
    vi.mocked(changeOrderStatus).mockResolvedValueOnce({ success: true, data: {} } as Awaited<
      ReturnType<typeof changeOrderStatus>
    >);
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Status' }));
    await user.click(await screen.findByRole('button', { name: 'status-delivered' }));

    await expect
      .poll(() => screen.queryByText('Zlecenie ZL-001 ma teraz status: zakończone.'))
      .toBeVisible();
    expect(changeOrderStatus).toHaveBeenCalledWith(1, 3);
    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Zmiana statusu zlecenia' }))
      .toBeNull();
  });

  it('keeps the Remove dialog closed when Escape is pressed before the delete finishes', async () => {
    const remove = deferred();
    vi.mocked(removeOrder).mockReturnValueOnce(
      remove.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof removeOrder>,
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

  it('shows the failure in a toast and keeps the Remove dialog open when the removal fails', async () => {
    vi.mocked(removeOrder).mockResolvedValueOnce({
      success: false,
      message: 'Zlecenie nie istnieje.',
    });
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    await user.click(await screen.findByRole('button', { name: 'Usuń' }));

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Czy jesteś pewny ?' })).toBeVisible();
  });

  it('confirms a removed Order in a toast and closes the Remove dialog', async () => {
    vi.mocked(removeOrder).mockResolvedValueOnce({ success: true, data: {} } as Awaited<
      ReturnType<typeof removeOrder>
    >);
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    await user.click(await screen.findByRole('button', { name: 'Usuń' }));

    await expect.poll(() => screen.queryByText('Zlecenie zostało usunięte.')).toBeVisible();
    expect(removeOrder).toHaveBeenCalledWith(1);
    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Czy jesteś pewny ?' }))
      .toBeNull();
  });
});
