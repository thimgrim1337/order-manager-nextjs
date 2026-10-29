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
import { formatDate, getToday, parseDate, toDate } from '@/lib/dates';
import type { Day } from '@/types/types';

/** A Monday-to-Sunday Week, held as its Monday (`yyyy-MM-dd`). */
export type Week = string & { readonly __brand: 'Week' };

export const weekOf = (date: string | Date): Week =>
  formatDate(startOfISOWeek(toDate(date))) as Week;

/** The Week containing today (see `getToday`). */
export const currentWeek = (now?: Date): Week => weekOf(getToday(now));

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

export type OrderDayRole = 'none' | 'loading' | 'unloading' | 'loading-unloading' | 'transit';

/** What an Order does on one day of the Week. */
export type OrderDay = {
  date: string;
  role: OrderDayRole;
  /** Monday only: the Order started in an earlier Week. */
  continuesBefore?: true;
  /** Sunday only: the Order ends in a later Week. */
  continuesAfter?: true;
};

type OrderDates = { startDate: string; endDate: string };

/** The Order's role on each of the Week's seven days, Monday first. */
export function orderDays(week: Week, order: OrderDates): OrderDay[] {
  const days = weekDays(week);
  const monday = days[0].date;
  const sunday = days[6].date;

  return days.map(({ date }) => {
    const day: OrderDay = { date, role: roleOn(date, order) };
    if (date === monday && order.startDate < monday) day.continuesBefore = true;
    if (date === sunday && order.endDate > sunday) day.continuesAfter = true;
    return day;
  });
}

// yyyy-MM-dd strings sort as dates.
function roleOn(date: string, { startDate, endDate }: OrderDates): OrderDayRole {
  if (date === startDate && date === endDate) return 'loading-unloading';
  if (date === startDate) return 'loading';
  if (date === endDate) return 'unloading';
  if (date > startDate && date < endDate) return 'transit';
  return 'none';
}
