import { describe, expect, it } from 'vitest';
import { apply, parse, reset, toSearchParams } from '@/features/OrdersTable/lib/orders-table-query';

describe('Orders Table Query: parse', () => {
  it('shows all Orders, newest Start Date first, on the first page when the URL is empty', () => {
    expect(parse({})).toEqual({
      search: undefined,
      startDate: undefined,
      endDate: undefined,
      driverId: undefined,
      statusId: undefined,
      sort: { id: 'startDate', desc: true },
      pageIndex: 0,
      pageSize: 10,
    });
  });

  it('reads every criterion from the URL, including sorting by Driver', () => {
    const raw = {
      globalFilters: 'Kraków',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      driverId: '7',
      statusId: '2',
      sort: 'driverId.asc',
      pageIndex: '3',
      pageSize: '50',
    };

    expect(parse(raw)).toEqual({
      search: 'Kraków',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      driverId: 7,
      statusId: 2,
      sort: { id: 'driverId', desc: false },
      pageIndex: 3,
      pageSize: 50,
    });
  });

  it('ignores each invalid param on its own and keeps the valid ones', () => {
    const raw = {
      globalFilters: 'Kraków',
      startDate: '2026-13-01',
      endDate: 'yesterday',
      driverId: 'abc',
      statusId: '0',
      sort: 'price.asc',
      pageIndex: '-1',
      pageSize: '1000',
    };

    expect(parse(raw)).toEqual({
      search: 'Kraków',
      startDate: undefined,
      endDate: undefined,
      driverId: undefined,
      statusId: undefined,
      sort: { id: 'startDate', desc: true },
      pageIndex: 0,
      pageSize: 10,
    });
  });
});

describe('Orders Table Query: apply', () => {
  const onPage3 = parse({ globalFilters: 'Kraków', pageIndex: '3', pageSize: '20' });

  it('goes back to the first page when a filter changes', () => {
    expect(apply(onPage3, { driverId: 7 })).toEqual({ ...onPage3, driverId: 7, pageIndex: 0 });
  });

  it('moves to the requested page without touching the criteria', () => {
    expect(apply(onPage3, { pageIndex: 4 })).toEqual({ ...onPage3, pageIndex: 4 });
  });

  it('stays on the same page when a change repeats the current values', () => {
    expect(apply(onPage3, { search: 'Kraków' })).toEqual(onPage3);
  });

  it('treats a blank search as no search', () => {
    const withoutSearch = parse({ pageIndex: '3' });

    expect(apply(withoutSearch, { search: '  ' })).toEqual(withoutSearch);
    expect(apply(onPage3, { search: '' })).toEqual({ ...onPage3, search: undefined, pageIndex: 0 });
  });

  it('falls back to newest Start Date first when sorting is cleared', () => {
    const sortedByDriver = parse({ sort: 'driverId.asc', pageIndex: '2' });

    expect(apply(sortedByDriver, { sort: undefined })).toEqual({
      ...sortedByDriver,
      sort: { id: 'startDate', desc: true },
      pageIndex: 0,
    });
  });
});

describe('Orders Table Query: reset', () => {
  it('clears filters, search and sorting but keeps the page size', () => {
    const filtered = parse({
      globalFilters: 'Kraków',
      startDate: '2026-10-01',
      driverId: '7',
      statusId: '2',
      sort: 'driverId.asc',
      pageIndex: '3',
      pageSize: '50',
    });

    expect(reset(filtered)).toEqual({ ...parse({}), pageSize: 50 });
  });
});

describe('Orders Table Query: toSearchParams', () => {
  it('writes nothing for the default view', () => {
    expect(toSearchParams(parse({})).toString()).toBe('');
  });

  it('writes only what differs from the default view, under the existing param names', () => {
    const query = parse({
      globalFilters: 'Kraków',
      startDate: '2026-10-01',
      driverId: '7',
      sort: 'driverId.asc',
      pageIndex: '3',
      pageSize: '50',
    });

    expect(toSearchParams(query).toString()).toBe(
      'globalFilters=Krak%C3%B3w&startDate=2026-10-01&driverId=7&sort=driverId.asc&pageIndex=3&pageSize=50',
    );
  });
});
