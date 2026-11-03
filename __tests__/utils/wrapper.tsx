import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, vi } from 'vitest';

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

export const createWrapper = () => {
  const queryClient = createQueryClient();

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/**
 * Renders `ui` with a fresh QueryClient and waits until its queries settle.
 *
 * A click while a query still loads can be lost (e.g. `pickDate` before the holidays arrive).
 */
export const renderWithQueries = async (ui: ReactNode) => {
  const queryClient = createQueryClient();

  const result = await act(async () =>
    render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
  );
  await vi.waitFor(() => expect(queryClient.isFetching()).toBe(0));

  return result;
};
