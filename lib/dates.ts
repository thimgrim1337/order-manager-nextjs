import { TZDate } from '@date-fns/tz';
import {
  addDays as addDaysLib,
  format,
  isWeekend as isWeekendLib,
  parse,
  subDays as subDaysLib,
} from 'date-fns';
import { pl } from 'date-fns/locale';

export const parseDate = (date: string, dateFormat: string = 'yyyy-MM-dd') =>
  // biome-ignore lint/plugin: reference date for fields the format leaves out, not a read of today
  parse(date, dateFormat, new Date());

// date-fns reads a bare `yyyy-MM-dd` string as UTC midnight, which is the previous day west of UTC.
export const toDate = (date: string | Date) => (typeof date === 'string' ? parseDate(date) : date);

export const formatDate = (
  date: Date | number | string | undefined,
  dateFormat: string = 'yyyy-MM-dd',
) => {
  if (!date) return '';

  return format(typeof date === 'number' ? date : toDate(date), dateFormat, { locale: pl });
};

const TIME_ZONE = 'Europe/Warsaw';

/** Today in the company's time zone (`yyyy-MM-dd`), whatever the server or browser zone is. */
// biome-ignore lint/plugin: the one read of the clock
export const getToday = (now: Date = new Date()) => formatDate(new TZDate(now, TIME_ZONE));

export const getYesterday = (date: Date | string) => formatDate(subDays(date, 1));

const subDays = (date: string | Date, amount: number) =>
  formatDate(subDaysLib(toDate(date), amount));

export const addDays = (date: string | Date, amount: number) =>
  formatDate(addDaysLib(toDate(date), amount));

/** After today in the company's time zone; today itself is not the future. yyyy-MM-dd strings sort as dates. */
export const isFuture = (date: string, now?: Date) => date > getToday(now);

export const isWeekend = (date: string | Date) => isWeekendLib(toDate(date));
