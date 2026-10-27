'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getToday } from '@/lib/dates';
import { apply, parse, type TimelineQuery, toSearchParams } from '../lib/timeline-query';

export default function useTimelineQuery() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const query = parse(Object.fromEntries(searchParams), getToday());

  function change(change: Partial<TimelineQuery>) {
    const next = apply(query, change);
    if (next === query) return;
    replace(`${pathname}?${toSearchParams(next)}`);
  }

  return { query, change };
}
