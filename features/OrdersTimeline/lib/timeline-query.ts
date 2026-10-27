import { parseId, parseIsoDate } from '@/features/shared/lib/search-param-parsers';
import { getFirstDayOfWeek } from '@/lib/dates';
import type { RawSearchParams } from '@/types/types';

export type TimelineQuery = {
  /** Monday of the shown Week. */
  week: string;
  driverId?: number;
};

export function parse(raw: RawSearchParams, today: string): TimelineQuery {
  return {
    week: getFirstDayOfWeek(parseIsoDate(raw.week) ?? today),
    driverId: parseId(raw.driverId),
  };
}

export function apply(query: TimelineQuery, change: Partial<TimelineQuery>): TimelineQuery {
  const next = { ...query, ...change };
  const week = getFirstDayOfWeek(next.week);

  if (week === query.week && next.driverId === query.driverId) return query;
  return { ...next, week };
}

export function toSearchParams(query: TimelineQuery): URLSearchParams {
  const params = new URLSearchParams({ week: query.week });
  if (query.driverId) params.set('driverId', String(query.driverId));
  return params;
}
