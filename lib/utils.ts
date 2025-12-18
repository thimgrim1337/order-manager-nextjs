import { SortingState } from '@tanstack/react-table';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDate, getYesterday } from './dates';
import { isFuture, isWeekend } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function analyzeGlobalFiltering(value: string) {
  const trimmed = value.trim();

  const numericValue = Number(trimmed);
  const isNumeric = !isNaN(numericValue) && trimmed !== '';

  // Sprawdź czy to data (formaty: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, DD.MM.YYYY)
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
    /^\d{2}\.\d{2}\.\d{4}$/, // DD.MM.YYYY
  ];

  const isDate = datePatterns.some((pattern) => pattern.test(trimmed));

  // Konwersja daty do formatu YYYY-MM-DD
  let normalizedDate = '';
  if (isDate) {
    if (trimmed.match(/^\d{4}-\d{2}-\d{2}$/)) {
      normalizedDate = trimmed;
    } else if (trimmed.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [day, month, year] = trimmed.split('-');
      normalizedDate = `${year}-${month}-${day}`;
    } else if (trimmed.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [day, month, year] = trimmed.split('/');
      normalizedDate = `${year}-${month}-${day}`;
    } else if (trimmed.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const [day, month, year] = trimmed.split('.');
      normalizedDate = `${year}-${month}-${day}`;
    }
  }

  return {
    isNumeric,
    isDate,
    numericValue,
    normalizedDate,
    searchTerm: `%${trimmed.toLowerCase()}%`,
  };
}

export function sortToState(sortString: string | undefined): SortingState {
  if (!sortString) return [];

  const [id, desc] = sortString.split('.');
  return [{ id, desc: desc === 'desc' }];
}

export const stateToSort = (sorting: SortingState | undefined) => {
  if (!sorting || sorting.length == 0) return undefined;

  const sort = sorting[0];

  return `${sort.id}.${sort.desc ? 'desc' : 'asc'}` as const;
};

export function getValidCurrencyDate(
  date: string,
  holidays: { endDate: string }[]
) {
  const yesterday = formatDate(getYesterday(date));

  // TODO: Sprawdź godzinę. Kurs z danego dnia jest ogłaszany po 11.

  const isHoliday = holidays.some((day) => day.endDate === yesterday);

  if (!isWeekend(yesterday) && !isFuture(yesterday) && !isHoliday)
    return yesterday;

  return getValidCurrencyDate(yesterday, holidays);
}
