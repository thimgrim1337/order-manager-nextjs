import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import * as timelineQuery from '@/features/OrdersTimeline/lib/timeline-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { nextWeek } from '@/lib/week';
import { holdNavigations, openUrl, requestedUrl } from '../utils/memory-url';
import { week } from '../utils/week';

function goBack() {
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

// No navigation renders: each change after the first builds on one still in flight.
beforeEach(() => {
  holdNavigations();
});

function lastUrl() {
  const url = requestedUrl();
  if (!url) throw new Error('No navigation since the page opened');
  return url;
}

describe('useUrlQuery with the Orders Table query', () => {
  beforeEach(() => {
    openUrl('/orders');
  });

  it('keeps both changes in the URL when the second comes before the first is rendered', () => {
    const { result } = renderHook(() => useUrlQuery(ordersTableQuery));

    result.current.change({ search: 'Kraków' });
    result.current.change({ statusId: 2 });

    const url = lastUrl();
    expect(url.pathname).toBe('/orders');
    expect(url.searchParams.get('search')).toBe('Kraków');
    expect(url.searchParams.get('statusId')).toBe('2');
  });

  it('skips a change that leaves the query as it is', () => {
    const { result } = renderHook(() => useUrlQuery(ordersTableQuery));

    result.current.change({ statusId: undefined });

    expect(requestedUrl()).toBeUndefined();
  });

  it('builds on the rendered query again after back/forward navigation', () => {
    const { result } = renderHook(() => useUrlQuery(ordersTableQuery));

    result.current.change({ search: 'Kraków' });
    goBack();
    result.current.change({ statusId: 2 });

    const url = lastUrl();
    expect(url.searchParams.get('search')).toBeNull();
    expect(url.searchParams.get('statusId')).toBe('2');
  });
});

// A Week other than the current one, so picking it is a change, not a no-op.
const MARCH_WEEK = week('2026-W10');

describe('useUrlQuery with the Timeline query', () => {
  beforeEach(() => {
    openUrl('/timeline');
  });

  it('moves two Weeks on two quick "Next week" changes', () => {
    const { result } = renderHook(() => useUrlQuery(timelineQuery));

    result.current.change({ week: MARCH_WEEK });
    result.current.change(({ week }) => ({ week: nextWeek(week) }));
    result.current.change(({ week }) => ({ week: nextWeek(week) }));

    expect(lastUrl().searchParams.get('week')).toBe('2026-W12');
  });

  it('keeps the new Week when a Driver is picked right after', () => {
    const { result } = renderHook(() => useUrlQuery(timelineQuery));

    result.current.change({ week: MARCH_WEEK });
    result.current.change({ driverId: 3 });

    const url = lastUrl();
    expect(url.pathname).toBe('/timeline');
    expect(url.searchParams.get('week')).toBe('2026-W10');
    expect(url.searchParams.get('driverId')).toBe('3');
  });
});
