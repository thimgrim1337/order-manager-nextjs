import { skipToken, useQuery } from '@tanstack/react-query';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import { getToday } from '@/lib/dates';
import { exchangeRateSource, NO_EXCHANGE_RATE, type StoredExchangeRate } from '@/lib/exchange-rate';
import { getExchangeRate } from '../services/nbp.services';

/**
 * The Exchange Rate an Order dated `endDate` in `currencyId` is saved with: the `stored` one while
 * its Unloading Date and Currency hold, otherwise the one NBP answers with.
 */
export default function useExchangeRate(
  stored: StoredExchangeRate,
  endDate: string,
  currencyId: number,
) {
  const { currencies } = useOrderChoices();

  const source = exchangeRateSource(stored, endDate, currencyId);
  // Any Currency but PLN needs its Exchange Rate, from which the Orders module works out the PLN Price.
  const currencyCode =
    source.kind === 'none'
      ? null
      : (currencies.find((currency) => currency.id === currencyId)?.code ?? null);
  const codeToFetch = source.kind === 'fetch' ? currencyCode : null;
  // The rate depends on today too, so a form open past midnight asks again.
  const today = getToday();

  const rateQuery = useQuery({
    queryKey: ['exchangeRate', codeToFetch, endDate, today],
    queryFn:
      codeToFetch && endDate ? () => getExchangeRate(codeToFetch, endDate, today) : skipToken,
    retry: false,
  });

  if (source.kind === 'stored') {
    return { currencyCode, currencyInfo: source.currencyInfo, isLoading: false, error: null };
  }

  return {
    currencyCode,
    // Without one, not the last Currency's rate, which would price this one with it.
    currencyInfo: rateQuery.data ?? NO_EXCHANGE_RATE,
    isLoading: rateQuery.isLoading,
    error: rateQuery.isError
      ? rateQuery.error.message || 'Wystąpił błąd podczas pobierania kursu.'
      : null,
  };
}
