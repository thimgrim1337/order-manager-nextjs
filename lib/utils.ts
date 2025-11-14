import { SortOptions } from '@/types/types';
import { SortingState } from '@tanstack/react-table';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export function sortToState(sortString: string): SortOptions | undefined {
  if (!sortString) return;

  const [field, order] = sortString.split('.');

  return {
    field,
    order: order === 'asc' ? 'asc' : 'desc',
  };
}

export function stateToSort(sortState: SortingState) {
  return sortState.length
    ? `${sortState[0].id}.${sortState[0].desc === true ? 'desc' : 'asc'}`
    : '';
}
