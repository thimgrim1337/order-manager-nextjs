'use client';

import { SearchParams } from '@/types/types';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

export function useFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const filters: SearchParams = Object.fromEntries(searchParams);

  function setFilters(filters: Partial<SearchParams>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(filters).forEach(([param, value]) => {
      if (value) params.set(param, String(value));
      else params.delete(param);
    });

    replace(`${pathname}?${params.toString()}`);
  }

  function resetFilters() {
    if (!Object.entries(filters).length) return;
    replace(`${pathname}`);
  }

  return { filters, setFilters, resetFilters };
}
