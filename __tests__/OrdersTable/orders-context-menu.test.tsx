import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import OrdersContextMenu from '@/features/OrdersTable/components/OrdersContextMenu/context-menu';
import { OrderChoicesProvider } from '@/features/shared/context/order-choices-context';
import { changeOrderStatus, createCity, removeOrder, updateOrder } from '@/lib/actions';
import { orderReadModel } from '../fixtures/order-read-model';
import { createCityInDialog, krakow } from '../utils/create-city-in-dialog';
import { deferred } from '../utils/deferred';
import { openDialog } from '../utils/open-dialog';
import { orderChoices } from '../utils/order-choices';
import { renderWithToaster } from '../utils/render-with-toaster';
import { renderWithQueries } from '../utils/wrapper';
import { writeResponse } from '../utils/write-response';

const order = orderReadModel({ orderNr: 'ZL-001' });

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
      save.promise.then(() => writeResponse.succeeded()),
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
    vi.mocked(changeOrderStatus).mockResolvedValueOnce(writeResponse.refused('NotFound'));
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Zmiana statusu zlecenia' })).toBeVisible();
  });

  it('sends one Status change while it runs, whichever Status button is clicked', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => writeResponse.succeeded()),
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
      save.promise.then(() => writeResponse.succeeded()),
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
    vi.mocked(changeOrderStatus).mockResolvedValueOnce(writeResponse.refused('NotFound'));
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
    vi.mocked(changeOrderStatus).mockResolvedValueOnce(writeResponse.succeeded());
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
      remove.promise.then(() => writeResponse.succeeded()),
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
    vi.mocked(removeOrder).mockResolvedValueOnce(writeResponse.refused('NotFound'));
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
      remove.promise.then(() => writeResponse.succeeded()),
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
    vi.mocked(removeOrder).mockResolvedValueOnce(writeResponse.refused('NotFound'));
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
    vi.mocked(removeOrder).mockResolvedValueOnce(writeResponse.succeeded());
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

  it('keeps a Remove dialog opened since open when the Status change closed mid-write succeeds', async () => {
    const save = deferred();
    vi.mocked(changeOrderStatus).mockReturnValueOnce(
      save.promise.then(() => writeResponse.succeeded()),
    );
    const { user } = setup();

    await openStatusDialog(user);
    await user.click(await screen.findByRole('button', { name: 'zakończone' }));
    await user.keyboard('{Escape}');
    await expect
      .poll(() => screen.queryByRole('heading', { name: 'Zmiana statusu zlecenia' }))
      .toBeNull();
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Usuń' }));
    expect(await screen.findByRole('heading', { name: 'Czy jesteś pewny ?' })).toBeVisible();

    await act(async () => save.resolve());

    await expect
      .poll(() => screen.queryByText('Zlecenie ZL-001 ma teraz status: zakończone.'))
      .toBeVisible();
    expect(screen.getByRole('heading', { name: 'Czy jesteś pewny ?' })).toBeVisible();
  });
});

describe('OrdersContextMenu edit', () => {
  const editHeading = { name: 'Edycja zlecenia ZL-001' };

  const editSetup = async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await renderWithQueries(
      <OrderChoicesProvider choices={orderChoices()}>
        <OrdersContextMenu order={order}>
          <div>ZL-001 row</div>
        </OrdersContextMenu>
        <Toaster />
      </OrderChoicesProvider>,
    );
    return { user };
  };

  const openEditDialog = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.pointer({ keys: '[MouseRight]', target: screen.getByText('ZL-001 row') });
    await user.click(await screen.findByRole('menuitem', { name: 'Edycja' }));
    expect(await screen.findByRole('heading', editHeading)).toBeVisible();
  };

  /** Saves the Order, then closes its dialog with Escape while the save still runs, and reopens it. */
  const reopenMidSave = async (user: ReturnType<typeof userEvent.setup>) => {
    await openEditDialog(user);
    await user.click(screen.getByRole('button', { name: 'Edytuj' }));
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));
    await user.keyboard('{Escape}');
    await expect.poll(() => screen.queryByRole('heading', editHeading)).toBeNull();
    await openEditDialog(user);
  };

  it('shows the save running, and sends no second one, in an edit dialog reopened mid-save', async () => {
    const save = deferred();
    vi.mocked(updateOrder).mockReturnValueOnce(save.promise.then(() => writeResponse.succeeded()));
    const { user } = await editSetup();

    await reopenMidSave(user);

    const sending = screen.getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(updateOrder).toHaveBeenCalledOnce();

    await act(async () => save.resolve());

    await expect.poll(() => screen.queryByRole('heading', editHeading)).toBeNull();
  });

  it('leaves an edit dialog reopened mid-save open and editable when the save is refused', async () => {
    const save = deferred();
    vi.mocked(updateOrder).mockReturnValueOnce(
      save.promise.then(() => writeResponse.refused('NotFound')),
    );
    const { user } = await editSetup();

    await reopenMidSave(user);
    await act(async () => save.resolve());

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByRole('heading', editHeading)).toBeVisible();
    await expect.poll(() => screen.queryByRole('button', { name: 'Zapisz' })).toBeEnabled();
    expect(screen.getByLabelText('Cena w walucie')).toBeEnabled();
  });

  it('toasts a taken Order Number refused after the edit dialog was reopened, whose form never held it', async () => {
    const save = deferred();
    vi.mocked(updateOrder).mockReturnValueOnce(
      save.promise.then(() => writeResponse.refused('OrderNrTaken')),
    );
    const { user } = await editSetup();

    await reopenMidSave(user);
    await act(async () => save.resolve());

    await expect.poll(() => screen.queryByText('Niepowodzenie')).toBeVisible();
  });

  it('shows a City create running, and sends no second one, in its dialog reopened from an edit dialog closed mid-create', async () => {
    const create = deferred();
    vi.mocked(createCity).mockReturnValueOnce(
      create.promise.then(() => writeResponse.succeeded(krakow)),
    );
    const { user } = await editSetup();

    await openEditDialog(user);
    await user.click(screen.getByRole('button', { name: 'Edytuj' }));
    const dialog = await createCityInDialog(user);
    await user.keyboard('{Escape}');
    await expect.poll(() => dialog).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    await expect.poll(() => screen.queryByRole('heading', editHeading)).toBeNull();
    await openEditDialog(user);
    await user.click(screen.getByRole('button', { name: 'Edytuj' }));
    const reopened = await openDialog(user, 'Dodaj nowe miejsce', 'Dodawanie nowego miejsca');

    const sending = within(reopened).getByRole('button', { name: 'Wysyłanie' });
    expect(sending).toBeDisabled();
    await user.click(sending);
    expect(createCity).toHaveBeenCalledOnce();

    await act(async () => create.resolve());

    await expect.poll(() => reopened).not.toBeInTheDocument();
  });
});
