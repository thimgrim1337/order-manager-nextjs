'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import {
  apply,
  type OrdersTableChange,
  type OrdersTableQuery,
  parse,
  reset,
  toSearchParams,
} from '../lib/orders-table-query';

// The search params the last change navigated to, until that navigation renders. A change made
// meanwhile (a debounced search, a click right after) builds on them, so it doesn't drop the first.
let pending: { pathname: string; search: string } | undefined;

export default function useOrdersTableQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const search = searchParams.toString();
  const query = parse(Object.fromEntries(searchParams));

  useEffect(() => {
    if (pending?.search === search) pending = undefined;
  }, [search]);

  useEffect(() => {
    const forget = () => {
      pending = undefined;
    };
    window.addEventListener('popstate', forget);
    return () => window.removeEventListener('popstate', forget);
  }, []);

  function latestQuery() {
    if (pending?.pathname !== pathname) return query;
    return parse(Object.fromEntries(new URLSearchParams(pending.search)));
  }

  function navigate(current: OrdersTableQuery, next: OrdersTableQuery) {
    if (next === current) return;
    const nextSearch = toSearchParams(next).toString();
    pending = { pathname, search: nextSearch };
    replace(`${pathname}?${nextSearch}`);
  }

  return {
    query,
    change: (change: OrdersTableChange) => {
      const current = latestQuery();
      navigate(current, apply(current, change));
    },
    reset: () => {
      const current = latestQuery();
      navigate(current, reset(current));
    },
  };
}
