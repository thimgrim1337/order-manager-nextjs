import { skipToken, useQuery } from '@tanstack/react-query';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import { CURRENCY } from '@/lib/consts';
import { getToday } from '@/lib/dates';
import type { OrderFormDto } from '@/lib/dto/order.dto';
import { orderFormOptions } from '../lib/order-form-options';
import { getExchangeRate } from '../services/nbp.services';

/** The Unloading Date and Currency an Order's Exchange Rate was stored for. */
type StoredExchangeRate = Pick<OrderFormDto, 'endDate' | 'currencyId' | 'currencyInfo'>;

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

  // Any Currency but PLN needs its Exchange Rate, from which the Orders module works out the PLN Price.
  const currencyCode =
    currencyId === CURRENCY.PLN
      ? null
      : (currencies.find((currency) => currency.id === currencyId)?.code ?? null);
  const keepsStoredRate =
    !!stored.currencyInfo.rate && endDate === stored.endDate && currencyId === stored.currencyId;
  const codeToFetch = keepsStoredRate ? null : currencyCode;
  // The rate depends on today too, so a form open past midnight asks again.
  const today = getToday();

  const rateQuery = useQuery({
    queryKey: ['exchangeRate', codeToFetch, endDate, today],
    queryFn:
      codeToFetch && endDate ? () => getExchangeRate(codeToFetch, endDate, today) : skipToken,
    retry: false,
  });

  if (keepsStoredRate) {
    return { currencyCode, currencyInfo: stored.currencyInfo, isLoading: false, error: null };
  }

  return {
    currencyCode,
    // Without one, not the last Currency's rate, which would price this one with it.
    currencyInfo: rateQuery.data ?? orderFormOptions.defaultValues.currencyInfo,
    isLoading: rateQuery.isLoading,
    error: rateQuery.isError
      ? rateQuery.error.message || 'Wystąpił błąd podczas pobierania kursu.'
      : null,
  };
}
