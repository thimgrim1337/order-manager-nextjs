import { describe, expect, it } from 'vitest';
import { apply, parse, toSearchParams } from '@/features/OrdersTimeline/lib/timeline-query';

// Thursday 2026-10-29, midday in Warsaw: Week 2026-W44.
const NOW = new Date('2026-10-29T11:00:00Z');

describe('Timeline Query: parse', () => {
  it('shows the current Week for all Drivers when the URL is empty', () => {
    expect(parse({}, NOW)).toEqual({ week: '2026-10-26', driverId: undefined });
  });

  it('shows the Week named in the URL, for the chosen Driver', () => {
    expect(parse({ week: '2026-W53', driverId: '7' }, NOW)).toEqual({
      week: '2026-12-28',
      driverId: 7,
    });
  });

  it.each([
    '2026-12-30',
    '2027-W53',
    '2026-W99',
    'garbage',
  ])('falls back to the current Week when the week param is %j', (week) => {
    expect(parse({ week, driverId: 'abc' }, NOW)).toEqual({
      week: '2026-10-26',
      driverId: undefined,
    });
  });
});

describe('Timeline Query: apply', () => {
  const current = parse({ driverId: '7' }, NOW);

  it('stays put when the change lands on the same Week and Driver', () => {
    expect(apply(current, { week: current.week, driverId: 7 })).toBe(current);
  });

  it('shows all Drivers when the Driver is cleared', () => {
    expect(apply(current, { driverId: undefined })).toEqual({
      week: '2026-10-26',
      driverId: undefined,
    });
  });
});

describe('Timeline Query: toSearchParams', () => {
  it('writes the Week as its ISO key, and the Driver when one is chosen', () => {
    expect(toSearchParams(parse({}, NOW)).toString()).toBe('week=2026-W44');
    expect(toSearchParams(parse({ week: '2027-W01', driverId: '7' }, NOW)).toString()).toBe(
      'week=2027-W01&driverId=7',
    );
  });

  it('round-trips through parse', () => {
    const query = parse({ week: '2026-W53', driverId: '3' }, NOW);
    expect(parse(Object.fromEntries(toSearchParams(query)), NOW)).toEqual(query);
  });
});
