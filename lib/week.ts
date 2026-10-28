import { TZDate } from '@date-fns/tz';
import {
  addDays,
  addWeeks,
  getISOWeek,
  getISOWeeksInYear,
  getISOWeekYear,
  isWeekend,
  startOfISOWeek,
  startOfISOWeekYear,
} from 'date-fns';
import { formatDate, parseDate } from '@/lib/dates';
import type { Day } from '@/types/types';

/** A Monday-to-Sunday Week, held as its Monday (`yyyy-MM-dd`). */
export type Week = string & { readonly __brand: 'Week' };

const TIME_ZONE = 'Europe/Warsaw';

const toDate = (date: string | Date) => (typeof date === 'string' ? parseDate(date) : date);

export const weekOf = (date: string | Date): Week =>
  formatDate(startOfISOWeek(toDate(date))) as Week;

/** The Week containing today in the company's time zone, whatever the server or browser zone is. */
export const currentWeek = (now: Date = new Date()): Week =>
  weekOf(formatDate(new TZDate(now, TIME_ZONE)));

export const nextWeek = (week: Week) => weekOf(addWeeks(parseDate(week), 1));

export const prevWeek = (week: Week) => weekOf(addWeeks(parseDate(week), -1));

/** The Week's seven days, Monday first. */
export const weekDays = (week: Week): Day[] =>
  Array.from({ length: 7 }, (_, index) => {
    const date = addDays(parseDate(week), index);

    return {
      date: formatDate(date),
      name: formatDate(date, 'iii'),
      isWeekend: isWeekend(date),
    };
  });

/** ISO 8601 Week Number: Week 1 contains 4 January. */
export const weekNumber = (week: Week) => getISOWeek(parseDate(week));

/** The ISO year the Week belongs to; differs from the calendar year of its Monday around New Year. */
export const weekYear = (week: Week) => getISOWeekYear(parseDate(week));

/** URL form of a Week: `2026-W44`. */
export const formatWeekKey = (week: Week) =>
  `${weekYear(week)}-W${String(weekNumber(week)).padStart(2, '0')}`;

/** Every Week of an ISO year (52 or 53), Week 1 first. */
export function weeksOfYear(isoYear: number): Week[] {
  const fourthOfJanuary = new Date(isoYear, 0, 4);
  const first = startOfISOWeekYear(fourthOfJanuary);

  return Array.from({ length: getISOWeeksInYear(fourthOfJanuary) }, (_, index) =>
    weekOf(addWeeks(first, index)),
  );
}

/** Reads `2026-W44`; undefined for anything else, including Week Numbers the year does not have. */
export function parseWeekKey(key: string): Week | undefined {
  const match = /^([1-9]\d{3})-W(\d{2})$/.exec(key);
  if (!match) return undefined;

  const weeks = weeksOfYear(Number(match[1]));
  return weeks[Number(match[2]) - 1];
}
