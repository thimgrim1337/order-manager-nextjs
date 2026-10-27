import { describe, expect, it } from 'vitest';
import { apply, parse, toSearchParams } from '@/features/OrdersTimeline/lib/timeline-query';

const THURSDAY = '2026-10-29';

describe('Timeline Query: parse', () => {
  it('shows the current Week for all Drivers when the URL is empty', () => {
    expect(parse({}, THURSDAY)).toEqual({ week: '2026-10-26', driverId: undefined });
  });

  it('shows the Week containing the date in the URL, for the chosen Driver', () => {
    expect(parse({ week: '2027-01-01', driverId: '7' }, THURSDAY)).toEqual({
      week: '2026-12-28',
      driverId: 7,
    });
  });

  it('falls back to the current Week when the week param is invalid', () => {
    expect(parse({ week: '2026-02-30', driverId: 'abc' }, THURSDAY)).toEqual({
      week: '2026-10-26',
      driverId: undefined,
    });
  });
});

describe('Timeline Query: apply', () => {
  const current = parse({ driverId: '7' }, THURSDAY);

  it('moves to the Week containing the given date', () => {
    expect(apply(current, { week: '2026-11-07' })).toEqual({ week: '2026-11-02', driverId: 7 });
  });

  it('stays put when the change lands on the same Week and Driver', () => {
    expect(apply(current, { week: '2026-10-29', driverId: 7 })).toBe(current);
  });

  it('shows all Drivers when the Driver is cleared', () => {
    expect(apply(current, { driverId: undefined })).toEqual({
      week: '2026-10-26',
      driverId: undefined,
    });
  });
});

describe('Timeline Query: toSearchParams', () => {
  it('always writes the Monday of the Week, and the Driver when one is chosen', () => {
    expect(toSearchParams(parse({}, THURSDAY)).toString()).toBe('week=2026-10-26');
    expect(toSearchParams(parse({ week: '2026-11-07', driverId: '7' }, THURSDAY)).toString()).toBe(
      'week=2026-11-02&driverId=7',
    );
  });
});
