import { describe, expect, it } from 'vitest';
import { getToday, isFuture } from '@/lib/dates';

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

describe('Dates: isFuture', () => {
  // Monday 2026-11-02 00:30 CET, still Sunday in UTC
  const now = new Date('2026-11-01T23:30:00Z');

  it('treats the day that has already started in Warsaw as today, not the future', () => {
    expect(isFuture('2026-11-02', now)).toBe(false);
    expect(isFuture('2026-11-01', now)).toBe(false);
  });

  it('treats the day after today in Warsaw as the future', () => {
    expect(isFuture('2026-11-03', now)).toBe(true);
  });
});
