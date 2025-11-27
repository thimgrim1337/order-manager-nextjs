import { City } from '@/types/types';
import { SortingState } from '@tanstack/react-table';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { createCity, getCityByName } from './dal/cityDAL';

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

export async function getCitiesIds(cities: City[]) {
  if (!cities || !Array.isArray(cities))
    throw new Error('Invalid cities array provided.');

  if (cities.length === 0) return [];

  try {
    const results = await Promise.all(
      cities.map(async (city) => {
        if (city.id && typeof city.id === 'number') return city.id;

        const existingCity = await getCityByName(city.name);

        if (existingCity?.id) return existingCity.id;

        const newCity = await createCity({
          ...city,
          name: city.name,
        });

        if (!newCity?.id)
          throw new Error(`Failed to create city: ${city.name}`);

        return newCity.id;
      })
    );
    return results;
  } catch (error) {
    throw new Error(`Failed to process cities: ${error}`);
  }
}
