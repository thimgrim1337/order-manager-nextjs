import { skipToken, useQuery } from '@tanstack/react-query';
import { getToday } from '@/lib/dates';
import type { CurrencyCode, CurrencyTable } from '@/types/types';
import { getValidCurrencyDate } from '../lib/utils';
import { getCurrencyRate } from '../services/nbp.services';
import { getHolidays } from '../services/openHolidays.services';

/** Fetches the Exchange Rate of `currency` for an Unloading Date `date`; none for a null `currency`. */
export default function useCurrencyInfo(
  date: string,
  currency: CurrencyCode | null,
  table: CurrencyTable = 'A',
) {
  const holidaysQuery = useQuery({
    queryKey: ['holidays'],
    queryFn: () => getHolidays(),
    staleTime: 1000 * 60 * 60 * 24,
  });

  const validDate =
    !date || !holidaysQuery.data ? getToday() : getValidCurrencyDate(date, holidaysQuery.data);

  const rateQuery = useQuery({
    queryKey: ['currencyRate', validDate, currency, table],
    queryFn:
      currency && validDate && !holidaysQuery.isLoading
        ? () => getCurrencyRate(validDate, currency, table)
        : skipToken,
    retry: false,
  });

  return {
    rate: rateQuery.data,
    isLoading: holidaysQuery.isLoading || rateQuery.isLoading,
    isError: holidaysQuery.isError || rateQuery.isError,
    error: holidaysQuery.error ?? rateQuery.error ?? null,
  };
}
