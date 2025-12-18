'use server';

import { apiCall } from '../helpers';

type OpenHolidaysResponse = {
  comment: [{ language: string; text: string }];
  endDate: string;
  id: string;
  name: [language: string, text: string];
  nationalwide: boolean;
  regionalScope: string;
  startDate: string;
  subdivisions: [code: string, shortName: string];
  temporalScope: string;
  type: string;
};

export async function getHolidays() {
  const result = await apiCall<OpenHolidaysResponse[]>(
    'https://openholidaysapi.org/PublicHolidays?countryIsoCode=PL&languageIsoCode=PL&validFrom=2025-12-01&validTo=2026-12-31'
  );

  if (result.type === 'error') {
    throw new Error('Nie udało się pobrać dni wolnych.');
  }

  return result.data;
}
