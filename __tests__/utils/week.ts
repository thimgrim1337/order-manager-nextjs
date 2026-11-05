import { parseWeekKey, type Week } from '@/lib/week';

/** The Week of a valid key, e.g. `week('2026-W44')`; throws on a key that names no Week. */
export function week(key: string): Week {
  const parsed = parseWeekKey(key);
  if (!parsed) throw new Error(`Not a Week key: ${key}`);
  return parsed;
}
