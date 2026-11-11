import { skipToken, useQuery } from '@tanstack/react-query';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import { failureMessage } from '@/lib/action-response';
import { getToday } from '@/lib/dates';
import { decideExchangeRate, hasExchangeRate, type StoredExchangeRate } from '@/lib/exchange-rate';
import { type Nbp, nbpApi } from '@/lib/nbp';

/**
 * An NBP that never answers. Deciding with it answers at once only for a rate known without NBP;
 * otherwise it leaves a promise that never settles, and the query asks the real NBP.
 */
const unaskedNbp: Nbp = { midRates: () => new Promise(() => {}) };

/**
 * The Exchange Rate an Order dated `endDate` in `currencyId` is saved with, as the form previews
 * it: the Exchange Rate module decides it from `stored` (none for a new Order) and NBP, as the
 * Orders module does on save.
 */
export default function useExchangeRate(
  stored: StoredExchangeRate | null,
  endDate: string,
  currencyId: number,
) {
  const { currencies } = useOrderChoices();

  const currency = currencies.find((choice) => choice.id === currencyId);
  // The rate depends on today too, so a form open past midnight asks again.
  const today = getToday();
  const decideWith =
    currency && endDate
      ? (nbp: Nbp) => decideExchangeRate(nbp, stored, currency, endDate, today)
      : null;

  const rateQuery = useQuery({
    queryKey: ['exchangeRate', currency, endDate, today, stored],
    queryFn: decideWith
      ? async () => {
          const [failure, rate] = await decideWith(nbpApi);
          if (failure) throw new Error(failureMessage(failure));
          return rate;
        }
      : skipToken,
    // Known without NBP, so a stored rate shows from the first render.
    initialData: () => {
      const known = decideWith?.(unaskedNbp);
      return known && !(known instanceof Promise) && !known[0] ? known[1] : undefined;
    },
    retry: false,
  });

  return {
    // A PLN Order shows no Exchange Rate.
    currencyCode: currency && hasExchangeRate(currency.id) ? currency.code : null,
    // Without one, not the last Currency's rate, which would price this one with it.
    currencyInfo: rateQuery.data ?? null,
    isLoading: rateQuery.isLoading,
    error: rateQuery.isError
      ? rateQuery.error.message || 'Wystąpił błąd podczas pobierania kursu.'
      : null,
  };
}
