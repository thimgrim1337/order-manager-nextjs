'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import type { RawSearchParams } from '@/features/shared/lib/search-param-parsers';

/** A page's query rules (its `lib/*-query.ts`): how its URL reads, changes and writes back. */
export type QueryModule<Query, Change> = {
  parse: (raw: RawSearchParams) => Query;
  apply: (query: Query, change: Change) => Query;
  toSearchParams: (query: Query) => URLSearchParams;
};

// The search params the last change navigated to, until that navigation renders. A change made
// meanwhile (a debounced search, a click right after) builds on them, so it doesn't drop the first.
// One for every page: a change on another pathname builds on its own rendered query.
let pending: { pathname: string; search: string } | undefined;

/**
 * A page's query held in its URL. A change builds on the query still navigating, not the
 * rendered one, and one that leaves the query as it is doesn't navigate.
 */
export default function useUrlQuery<Query, Change>({
  parse,
  apply,
  toSearchParams,
}: QueryModule<Query, Change>) {
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

  /** Replaces the query with one built from the latest. */
  function update(next: (current: Query) => Query) {
    const current = latestQuery();
    const nextQuery = next(current);
    if (nextQuery === current) return;

    const nextSearch = toSearchParams(nextQuery).toString();
    pending = { pathname, search: nextSearch };
    replace(`${pathname}?${nextSearch}`);
  }

  /** Applies a change, or one built from the latest query (e.g. the Week after it). */
  function change(change: Change | ((current: Query) => Change)) {
    update((current) =>
      apply(
        current,
        typeof change === 'function' ? (change as (current: Query) => Change)(current) : change,
      ),
    );
  }

  return { query, change, update };
}
