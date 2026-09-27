'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SearchParams } from '@/types/types';

export default function useFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const rawFilters = Object.fromEntries(searchParams);
  const filters: SearchParams = SearchParams.parse(rawFilters);

  function setFilters(newFilters: Partial<SearchParams>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(newFilters).forEach(([param, value]) => {
      if (value !== undefined && value !== null && value !== '') params.set(param, String(value));
      else params.delete(param);
    });

    replace(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    const params = new URLSearchParams(searchParams);

    Object.keys(filters).forEach((param) => {
      if (param === 'pageSize' || param === 'pageIndex') return;
      else params.delete(param);
    });

    replace(`${pathname}?${params.toString()}`);
  }

  return { filters, setFilters, resetFilters };
}
