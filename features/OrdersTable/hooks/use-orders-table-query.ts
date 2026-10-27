'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  apply,
  type OrdersTableChange,
  type OrdersTableQuery,
  parse,
  reset,
  toSearchParams,
} from '../lib/orders-table-query';

export default function useOrdersTableQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const query = parse(Object.fromEntries(searchParams));

  function navigate(next: OrdersTableQuery) {
    if (next === query) return;
    replace(`${pathname}?${toSearchParams(next)}`);
  }

  return {
    query,
    change: (change: OrdersTableChange) => navigate(apply(query, change)),
    reset: () => navigate(reset(query)),
  };
}
