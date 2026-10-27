import z from 'zod';
import {
  parseId,
  parseIsoDate,
  parseText,
  type RawSearchParam,
} from '@/features/shared/lib/search-param-parsers';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
  ORDER_SORT_FIELDS,
  type OrderSortField,
} from '@/lib/consts';
import type { RawSearchParams, SortParams } from '@/types/types';

export type OrdersTableQuery = {
  search?: string;
  startDate?: string;
  endDate?: string;
  driverId?: number;
  statusId?: number;
  sort: SortParams;
  pageIndex: number;
  pageSize: number;
};

const DEFAULT_SORT: SortParams = { id: 'startDate', desc: true };

const SortParam = z.templateLiteral([z.enum(ORDER_SORT_FIELDS), '.', z.enum(['asc', 'desc'])]);
const PageIndexParam = z.coerce.number().int().min(0);
const PageSizeParam = z.coerce.number().int().min(10).max(100);

function parseSort(value: RawSearchParam): SortParams {
  const result = SortParam.safeParse(parseText(value));
  if (!result.success) return DEFAULT_SORT;

  const [id, direction] = result.data.split('.') as [OrderSortField, 'asc' | 'desc'];
  return { id, desc: direction === 'desc' };
}

function parseNumber(schema: z.ZodType<number>, value: RawSearchParam, fallback: number) {
  const result = schema.safeParse(parseText(value));
  return result.success ? result.data : fallback;
}

export function parse(raw: RawSearchParams): OrdersTableQuery {
  return {
    search: parseText(raw.globalFilters),
    startDate: parseIsoDate(raw.startDate),
    endDate: parseIsoDate(raw.endDate),
    driverId: parseId(raw.driverId),
    statusId: parseId(raw.statusId),
    sort: parseSort(raw.sort),
    pageIndex: parseNumber(PageIndexParam, raw.pageIndex, DEFAULT_PAGE_INDEX),
    pageSize: parseNumber(PageSizeParam, raw.pageSize, DEFAULT_PAGE_SIZE),
  };
}

export type OrdersTableChange = Partial<OrdersTableQuery>;

export function apply(query: OrdersTableQuery, change: OrdersTableChange): OrdersTableQuery {
  const next = { ...query, ...change };
  if ('search' in change) next.search = parseText(change.search);
  if ('sort' in change) next.sort = change.sort ?? DEFAULT_SORT;

  const changedKeys = (Object.keys(change) as (keyof OrdersTableQuery)[]).filter(
    (key) => !isSameValue(query[key], next[key]),
  );

  if (changedKeys.length === 0) return query;
  if (changedKeys.every((key) => key === 'pageIndex')) return next;
  return { ...next, pageIndex: DEFAULT_PAGE_INDEX };
}

function isSameValue(a: OrdersTableQuery[keyof OrdersTableQuery], b: typeof a) {
  if (typeof a === 'object' && typeof b === 'object') return a.id === b.id && a.desc === b.desc;
  return a === b;
}

export function reset(query: OrdersTableQuery): OrdersTableQuery {
  return { ...parse({}), pageSize: query.pageSize };
}

export function toSearchParams(query: OrdersTableQuery): URLSearchParams {
  const params = new URLSearchParams();
  const { sort } = query;

  if (query.search) params.set('globalFilters', query.search);
  if (query.startDate) params.set('startDate', query.startDate);
  if (query.endDate) params.set('endDate', query.endDate);
  if (query.driverId) params.set('driverId', String(query.driverId));
  if (query.statusId) params.set('statusId', String(query.statusId));
  if (!isSameValue(sort, DEFAULT_SORT))
    params.set('sort', `${sort.id}.${sort.desc ? 'desc' : 'asc'}`);
  if (query.pageIndex !== DEFAULT_PAGE_INDEX) params.set('pageIndex', String(query.pageIndex));
  if (query.pageSize !== DEFAULT_PAGE_SIZE) params.set('pageSize', String(query.pageSize));

  return params;
}
