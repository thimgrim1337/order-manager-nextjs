import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import useOrdersTableQuery from '@/features/OrdersTable/hooks/use-orders-table-query';

const replaceMock = vi.hoisted(() => vi.fn());

// The rendered search params stay empty: no navigation has rendered yet.
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/orders',
  useRouter: () => ({ replace: replaceMock }),
}));

describe('useOrdersTableQuery', () => {
  it('keeps both changes in the URL when the second comes before the first is rendered', () => {
    const { result } = renderHook(() => useOrdersTableQuery());

    result.current.change({ search: 'Kraków' });
    result.current.change({ statusId: 2 });

    const url = new URL(replaceMock.mock.lastCall?.[0], window.location.origin);
    expect(url.pathname).toBe('/orders');
    expect(url.searchParams.get('globalFilters')).toBe('Kraków');
    expect(url.searchParams.get('statusId')).toBe('2');
  });
});
