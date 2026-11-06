import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { settleWrite } from '@/features/shared/lib/settle-write';
import { renderWithToaster } from '../utils/render-with-toaster';

const close = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  renderWithToaster(<div />);
});

describe('settleWrite', () => {
  it('confirms a successful write in a toast and closes the dialog', async () => {
    await settleWrite(async () => ({ success: true, data: {} }), {
      closeDialog: close,
      successDescription: 'Zlecenie zapisane.',
    });

    await expect.poll(() => screen.queryByText('Zlecenie zapisane.')).toBeVisible();
    expect(screen.getByText('Sukces')).toBeVisible();
    expect(close).toHaveBeenCalledOnce();
  });

  it("shows a failed write's message in a toast and keeps the dialog open", async () => {
    await settleWrite(async () => ({ success: false, message: 'Zlecenie nie istnieje.' }), {
      closeDialog: close,
      errorTitle: 'Nie udało się zapisać.',
      successDescription: 'Zlecenie zapisane.',
    });

    await expect.poll(() => screen.queryByText('Zlecenie nie istnieje.')).toBeVisible();
    expect(screen.getByText('Nie udało się zapisać.')).toBeVisible();
    expect(screen.queryByText('Zlecenie zapisane.')).toBeNull();
    expect(close).not.toHaveBeenCalled();
  });

  it('titles a failure toast "Niepowodzenie" when given no title', async () => {
    await settleWrite(async () => ({ success: false, message: 'Zlecenie nie istnieje.' }), {
      closeDialog: close,
      successDescription: 'Zlecenie zapisane.',
    });

    await expect.poll(() => screen.queryByText('Niepowodzenie')).toBeVisible();
  });

  it('shows a fixed message when the write throws, hiding its error, and keeps the dialog open', async () => {
    vi.spyOn(console, 'error').mockImplementationOnce(() => {});

    await settleWrite(
      async () => {
        throw new Error('connection lost');
      },
      { closeDialog: close, successDescription: 'Zlecenie zapisane.' },
    );

    await expect
      .poll(() => screen.queryByText('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.'))
      .toBeVisible();
    expect(screen.queryByText(/connection lost/)).toBeNull();
    expect(close).not.toHaveBeenCalled();
  });
});
