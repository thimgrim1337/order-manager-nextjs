import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersContextMenu from '@/features/OrdersTable/components/OrdersContextMenu/context-menu';
import { changeOrderStatus, removeOrder } from '@/lib/actions';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { deferred } from '../utils/deferred';
import { renderWithToaster } from '../utils/render-with-toaster';

const order = {
  id: 1,
  orderNr: 'ZL-001',
  status: { id: 1, name: 'pending' },
} as unknown as OrderReadModel;

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

const openStatusDialog = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
  await user.click(await screen.findByRole('menuitem', { name: 'Status' }));
};

describe('OrdersContextMenu', () => {
  it('names each Status button by its label and describes it by its description', async () => {
    const { user } = setup();

    await openStatusDialog(user);

    expect(await screen.findByRole('button', { name: 'zakończone' })).toHaveAccessibleDescription(
      'Zlecenie zostało zakończone.',
    );
  });

  it('keeps the Status dialog closed when Escape is pressed before the save finishes', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => ({ success: true, data: {} })) as ReturnType<
        typeof changeOrderStatus
      >,
    );
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));
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

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Zmiana statusu zlecenia' })).toBeVisible();
  });

  it('sends one Status change while it runs, whichever Status button is clicked', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => ({ success: true, data: {} })) as ReturnType<
        typeof changeOrderStatus
      >,
    );
    const { user } = setup();

    await openStatusDialog(user);
    await user.dblClick(await screen.findByRole('button', { name: 'zakończone' }));

    expect(screen.getByRole('button', { name: 'zakończone' })).toHaveAccessibleDescription(
      'Wysyłanie',
    );
    for (const status of ['w trakcie', 'anulowane', 'zakończone']) {
      const button = screen.getByRole('button', { name: status });
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(changeOrderStatus).toHaveBeenCalledOnce();

    await act(async () => save.resolve());
  });

  it('sends no second Status change from a Status dialog reopened while the first runs', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => ({ success: true, data: {} })) as ReturnType<
        typeof changeOrderStatus
      >,
    );
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));
    await user.keyboard('{Escape}');
    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Zmiana statusu zlecenia' }))
      .toBeNull();
    await openStatusDialog(user);

    const button = await screen.findByRole('button', { name: 'anulowane' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(changeOrderStatus).toHaveBeenCalledOnce();

    await act(async () => save.resolve());
  });

  it('lets the user retry the Status change once it failed', async () => {
    vi.mocked(changeOrderStatus).mockResolvedValueOnce({
      success: false,
      message: 'Zlecenie nie istnieje.',
    });
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));
    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();

    const retry = screen.getByRole('button', { name: 'anulowane' });
    await expect.poll(() => retry).toBeEnabled();
    await user.click(retry);

    expect(changeOrderStatus).toHaveBeenCalledTimes(2);
  });

  it('confirms a changed Status in a toast and closes the Status dialog', async () => {
    vi.mocked(changeOrderStatus).mockResolvedValueOnce({ success: true, data: {} } as Awaited<
      ReturnType<typeof changeOrderStatus>
    >);
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));

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

  it('sends one removal while it runs, however often "Usuń" is clicked', async () => {
    const remove = deferred();
    vi.mocked(removeOrder).mockReturnValueOnce(
      remove.promise.then(() => ({ success: true, data: {} })) as ReturnType<typeof removeOrder>,
    );
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    await user.dblClick(await screen.findByRole('button', { name: 'Usuń' }));

    const sending = screen.getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(removeOrder).toHaveBeenCalledOnce();

    await act(async () => remove.resolve());
  });

  it('lets the user retry the removal once it failed', async () => {
    vi.mocked(removeOrder).mockResolvedValueOnce({
      success: false,
      message: 'Zlecenie nie istnieje.',
    });
    const { user } = setup();

    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    await user.click(await screen.findByRole('button', { name: 'Usuń' }));
    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();

    const retry = screen.getByRole('button', { name: 'Usuń' });
    await expect.poll(() => retry).toBeEnabled();
    await user.click(retry);

    expect(removeOrder).toHaveBeenCalledTimes(2);
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
