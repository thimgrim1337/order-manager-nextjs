import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useFormSubmit from '@/features/OrderForm/hooks/useFormSubmit';

const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());
const refreshMock = vi.hoisted(() => vi.fn());
const onDialogClose = vi.fn();

vi.mock('sonner', () => ({
  toast: {
    success: toastSuccessMock,
    error: toastErrorMock,
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

describe('useFormSubmit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('success case', async () => {
    const customer = { id: 1, tax: 'PL7743241555', name: 'DEVIL' };

    const actionMock = vi.fn().mockResolvedValueOnce({
      success: true,
      data: { name: customer.name },
    });

    const { result } = renderHook(() => useFormSubmit(actionMock, onDialogClose));

    await act(async () => {
      await result.current.submitForm(customer, {
        errorTitle: 'Nie udało się zapisać.',
        successTitle: 'OK',
        successDescription: 'Zlecenie zapisane',
      });
    });

    expect(actionMock).toHaveBeenCalledWith(customer);
    expect(toastSuccessMock).toHaveBeenCalledWith(
      'OK',
      expect.objectContaining({
        description: 'Zlecenie zapisane',
        richColors: true,
      }),
    );
    expect(refreshMock).toHaveBeenCalled();
    expect(onDialogClose).toHaveBeenCalled();
  });

  it('error case', async () => {
    const actionMock = vi.fn().mockResolvedValueOnce({
      message: 'API Error',
    });

    const { result } = renderHook(() => useFormSubmit(actionMock, onDialogClose));

    await act(async () => {
      await result.current.submitForm({ foo: 'bar' } as unknown, {
        errorTitle: 'Nie udało się zapisać.',
        successTitle: 'OK',
      });
    });

    expect(actionMock).toHaveBeenCalledWith({ foo: 'bar' });

    expect(toastErrorMock).toHaveBeenCalledWith(
      'Nie udało się zapisać.',
      expect.objectContaining({
        description: 'API Error',
        richColors: true,
      }),
    );

    expect(onDialogClose).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });

  it('uses fallback titles when not provided', async () => {
    const actionMock = vi.fn().mockResolvedValueOnce({ message: 'Błąd' });
    const { result } = renderHook(() => useFormSubmit(actionMock, onDialogClose));

    await act(async () => {
      await result.current.submitForm({} as unknown, {}); // brak errorTitle
    });

    expect(toastErrorMock).toHaveBeenCalledWith('Niepowodzenie', expect.anything());
  });

  it('shows a fixed message when the action throws, keeping the dialog open', async () => {
    const actionMock = vi.fn().mockRejectedValueOnce(new Error('connection lost'));
    const { result } = renderHook(() => useFormSubmit(actionMock, onDialogClose));

    await act(async () => {
      await result.current.submitForm({}, { errorTitle: 'Nie udało się zapisać.' });
    });

    expect(toastErrorMock).toHaveBeenCalledWith('Nie udało się zapisać.', {
      description: 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.',
      richColors: true,
    });
    expect(onDialogClose).not.toHaveBeenCalled();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
