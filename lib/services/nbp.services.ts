import { Currencies } from '@/types/types';
import { apiCall } from '../helpers';

export type NBPApiResponse = {
  table: string;
  currency: string;
  code: string;
  rates: [
    {
      no: string;
      effectiveDate: string;
      mid: number;
    },
  ];
};

export async function getCurrencyRate(
  date: string,
  table: 'A' | 'B' | 'C' = 'A',
  code: Currencies = 'EUR',
) {
  if (code === 'PLN' || !date) return null;

  const result = await apiCall<NBPApiResponse>(
    `https://api.nbp.pl/api/exchangerates/rates/${table}/${code}/${date}/?format=json`,
  );

  if (result.type === 'error') {
    throw new Error('Nie udało się pobrać kursu walut.');
  }

  return result.data;
}
