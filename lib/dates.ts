import { addDays, format, parse, subDays } from 'date-fns';
import { pl } from 'date-fns/locale';

export const formatDate = (
  date: Date | number | string | undefined,
  dateFormat: string = 'yyyy-MM-dd'
) => {
  if (!date) return '';

  return format(date, dateFormat, { locale: pl });
};

export const parseDate = (date: string, dateFormat: string = 'yyyy-MM-dd') =>
  parse(date, dateFormat, new Date());

export const getToday = () => formatDate(Date.now());
export const getTomorrow = () => formatDate(addDays(getToday(), 1));
export const getYesterday = (date: Date | string) =>
  formatDate(subDays(date, 1));
