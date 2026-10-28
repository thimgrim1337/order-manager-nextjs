import { parseId, parseWeek } from '@/features/shared/lib/search-param-parsers';
import { currentWeek, formatWeekKey, type Week } from '@/lib/week';
import type { RawSearchParams } from '@/types/types';

export type TimelineQuery = {
  week: Week;
  driverId?: number;
};

export function parse(raw: RawSearchParams, now?: Date): TimelineQuery {
  return {
    week: parseWeek(raw.week) ?? currentWeek(now),
    driverId: parseId(raw.driverId),
  };
}

export function apply(query: TimelineQuery, change: Partial<TimelineQuery>): TimelineQuery {
  const next = { ...query, ...change };

  if (next.week === query.week && next.driverId === query.driverId) return query;
  return next;
}

export function toSearchParams(query: TimelineQuery): URLSearchParams {
  const params = new URLSearchParams({ week: formatWeekKey(query.week) });
  if (query.driverId) params.set('driverId', String(query.driverId));
  return params;
}
