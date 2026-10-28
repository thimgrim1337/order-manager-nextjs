import z from 'zod';
import { parseWeekKey } from '@/lib/week';
import type { RawSearchParams } from '@/types/types';

// Each parser returns undefined for a missing or invalid value, so one bad param never discards the others.

export type RawSearchParam = RawSearchParams[string];

const first = (value: RawSearchParam) => (Array.isArray(value) ? value[0] : value);

export function parseText(value: RawSearchParam) {
  const text = first(value)?.trim();
  return text ? text : undefined;
}

export function parseId(value: RawSearchParam) {
  const result = z.coerce.number().int().positive().safeParse(first(value));
  return result.success ? result.data : undefined;
}

export function parseIsoDate(value: RawSearchParam) {
  const result = z.iso.date().safeParse(first(value));
  return result.success ? result.data : undefined;
}

export function parseWeek(value: RawSearchParam) {
  const key = first(value);
  return key ? parseWeekKey(key) : undefined;
}
