'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apply, parse, type TimelineQuery, toSearchParams } from '../lib/timeline-query';

export default function useTimelineQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const query = parse(Object.fromEntries(searchParams));

  function change(change: Partial<TimelineQuery>) {
    const next = apply(query, change);
    if (next === query) return;
    replace(`${pathname}?${toSearchParams(next)}`);
  }

  return { query, change };
}
