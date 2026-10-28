import { describe, expect, it } from 'vitest';
import {
  currentWeek,
  formatWeekKey,
  nextWeek,
  orderDays,
  parseWeekKey,
  prevWeek,
  type Week,
  weekDays,
  weekNumber,
  weekOf,
  weeksOfYear,
  weekYear,
} from '@/lib/week';

describe('Week: weekOf', () => {
  it('puts a Wednesday and the following Sunday in the same Week, starting on Monday', () => {
    expect(weekOf('2026-10-28')).toBe('2026-10-26');
    expect(weekOf('2026-11-01')).toBe('2026-10-26');
  });
});

describe('Week: ISO numbering', () => {
  it('numbers Weeks by ISO 8601, including Weeks crossing the year boundary', () => {
    expect(formatWeekKey(weekOf('2026-12-28'))).toBe('2026-W53');
    expect(formatWeekKey(weekOf('2027-01-01'))).toBe('2026-W53');
    expect(formatWeekKey(weekOf('2027-01-04'))).toBe('2027-W01');
  });

  it('exposes the Week Number and its ISO year', () => {
    const week = weekOf('2027-01-01');
    expect(weekNumber(week)).toBe(53);
    expect(weekYear(week)).toBe(2026);
  });
});

describe('Week: navigation', () => {
  it('steps over the year boundary in both directions', () => {
    const w53 = weekOf('2026-12-28');
    const w01 = weekOf('2027-01-04');
    expect(nextWeek(w53)).toBe(w01);
    expect(prevWeek(w01)).toBe(w53);
  });
});

describe('Week: weeksOfYear', () => {
  it('lists 53 Weeks for 2026 and 52 for 2027, from Week 1 to the last Week', () => {
    const weeks2026 = weeksOfYear(2026);
    expect(weeks2026).toHaveLength(53);
    expect(weeks2026[0]).toBe('2025-12-29');
    expect(weeks2026.at(-1)).toBe('2026-12-28');

    const weeks2027 = weeksOfYear(2027);
    expect(weeks2027).toHaveLength(52);
    expect(weeks2027[0]).toBe('2027-01-04');
  });
});

describe('Week: week key', () => {
  it.each(['2026-W44', '2026-W01', '2026-W53', '2027-W01', '2027-W52'])('round-trips %s', (key) => {
    const week = parseWeekKey(key);
    expect(week).toBeDefined();
    expect(formatWeekKey(week as Week)).toBe(key);
  });

  it('reads a key as the Monday of that Week', () => {
    expect(parseWeekKey('2026-W44')).toBe('2026-10-26');
    expect(parseWeekKey('2026-W01')).toBe('2025-12-29');
  });

  it.each([
    '2027-W53',
    '2026-W99',
    '2026-W00',
    '0050-W01',
    '2026-10-26',
    '',
    'garbage',
  ])('rejects %j', (key) => {
    expect(parseWeekKey(key)).toBeUndefined();
  });
});

describe('Week: currentWeek', () => {
  it('switches to the new Week at Monday midnight in Warsaw, while it is still Sunday in UTC', () => {
    // Monday 2026-11-02 00:30 CET
    expect(currentWeek(new Date('2026-11-01T23:30:00Z'))).toBe('2026-11-02');
    // Monday 2026-06-29 00:30 CEST
    expect(currentWeek(new Date('2026-06-28T22:30:00Z'))).toBe('2026-06-29');
  });

  it('stays in the old Week until Monday midnight in Warsaw', () => {
    // Sunday 2026-11-01 23:30 CET
    expect(currentWeek(new Date('2026-11-01T22:30:00Z'))).toBe('2026-10-26');
  });
});

describe('Week: weekDays', () => {
  it('lists seven days from Monday to Sunday, marking Saturday and Sunday as weekend', () => {
    const days = weekDays(weekOf('2026-12-30'));

    expect(days.map((day) => day.date)).toEqual([
      '2026-12-28',
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
      '2027-01-03',
    ]);
    expect(days.map((day) => day.isWeekend)).toEqual([
      false,
      false,
      false,
      false,
      false,
      true,
      true,
    ]);
    expect(days[0].name).toBe('pon.');
  });
});

describe('Week: orderDays', () => {
  const w44 = weekOf('2026-10-26');
  const roles = (days: ReturnType<typeof orderDays>) => days.map((day) => day.role);
  const flagged = (days: ReturnType<typeof orderDays>) =>
    days.filter((day) => day.continuesBefore || day.continuesAfter);

  it('marks loading, transit and unloading days of an Order inside the Week', () => {
    expect(roles(orderDays(w44, { startDate: '2026-10-27', endDate: '2026-10-30' }))).toEqual([
      'none',
      'loading',
      'transit',
      'transit',
      'unloading',
      'none',
      'none',
    ]);
  });

  it('marks a day with both loading and unloading as loading-unloading', () => {
    expect(roles(orderDays(w44, { startDate: '2026-10-28', endDate: '2026-10-28' }))).toEqual([
      'none',
      'none',
      'loading-unloading',
      'none',
      'none',
      'none',
      'none',
    ]);
  });

  it('flags Monday as continuing from the previous Week when the Order starts before Monday', () => {
    const days = orderDays(w44, { startDate: '2026-10-23', endDate: '2026-10-27' });

    expect(roles(days)).toEqual(['transit', 'unloading', 'none', 'none', 'none', 'none', 'none']);
    expect(days[0].continuesBefore).toBe(true);
    expect(flagged(days)).toHaveLength(1);
  });

  it('flags Sunday as continuing into the next Week when the Order ends after Sunday', () => {
    const days = orderDays(w44, { startDate: '2026-10-30', endDate: '2026-11-02' });

    expect(roles(days)).toEqual(['none', 'none', 'none', 'none', 'loading', 'transit', 'transit']);
    expect(days[6].continuesAfter).toBe(true);
    expect(flagged(days)).toHaveLength(1);
  });

  it('marks every day as transit, with both flags, when the Order spans the whole Week', () => {
    const days = orderDays(w44, { startDate: '2026-10-20', endDate: '2026-11-05' });

    expect(roles(days)).toEqual(Array(7).fill('transit'));
    expect(days[0].continuesBefore).toBe(true);
    expect(days[6].continuesAfter).toBe(true);
  });
});
