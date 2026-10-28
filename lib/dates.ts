import {
  addDays as addDaysLib,
  format,
  isFuture as isFutureLib,
  isWeekend as isWeekendLib,
  parse,
  subDays as subDaysLib,
} from 'date-fns';
import { pl } from 'date-fns/locale';

export const parseDate = (date: string, dateFormat: string = 'yyyy-MM-dd') =>
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

export const getToday = () => formatDate(Date.now());

export const getTomorrow = () => formatDate(addDays(getToday(), 1));

export const getYesterday = (date: Date | string) => formatDate(subDays(date, 1));

export const subDays = (date: string | Date, amount: number) =>
  formatDate(subDaysLib(toDate(date), amount));

export const addDays = (date: string | Date, amount: number) =>
  formatDate(addDaysLib(toDate(date), amount));

export const isFuture = (date: string | Date) => isFutureLib(toDate(date));

export const isWeekend = (date: string | Date) => isWeekendLib(toDate(date));
