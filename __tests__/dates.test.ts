import { describe, expect, it } from 'vitest';
import { getToday } from '@/lib/dates';

describe('Dates: getToday', () => {
  it('is already the next day after midnight in Warsaw, while it is still the previous day in UTC', () => {
    // Monday 2026-11-02 00:30 CET
    expect(getToday(new Date('2026-11-01T23:30:00Z'))).toBe('2026-11-02');
    // Monday 2026-06-29 00:30 CEST
    expect(getToday(new Date('2026-06-28T22:30:00Z'))).toBe('2026-06-29');
  });

  it('stays on the old day until midnight in Warsaw', () => {
    // Sunday 2026-11-01 23:30 CET
    expect(getToday(new Date('2026-11-01T22:30:00Z'))).toBe('2026-11-01');
  });
});
