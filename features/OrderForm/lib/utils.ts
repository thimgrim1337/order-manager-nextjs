import type { OpenHolidaysResponse } from '@/features/OrderForm/services/openHolidays.services';
import { getToday, getYesterday, isFuture, isWeekend } from '@/lib/dates';

export function getValidCurrencyDate(
  date: string,
  holidays: Pick<OpenHolidaysResponse, 'endDate'>[],
  now?: Date,
) {
  try {
    // getYesterday throws on an invalid date, which isFuture's string compare can't catch.
    const yesterday = getYesterday(date);
    // A future date starts from today; the walk below steps back if today isn't a business day.
    const candidate = isFuture(date, now) ? getToday(now) : yesterday;

    const isHoliday = holidays.some((day) => day.endDate === candidate);

    if (!isWeekend(candidate) && !isHoliday) return candidate;

    return getValidCurrencyDate(candidate, holidays, now);
  } catch (error) {
    console.log(error);
    return date;
  }
}
