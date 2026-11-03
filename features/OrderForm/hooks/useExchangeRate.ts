import { useOrderData } from '@/features/shared/context/order-context';
import { CURRENCY } from '@/lib/consts';
import type { CurrencyInfo } from '@/types/types';
import { orderFormOptions } from '../lib/order-form-options';
import { toCurrencyInfo } from '../services/nbp.services';
import useCurrencyInfo from './useCurrencyInfo';

type StoredRate = { endDate: string; currencyId: number; currencyInfo: CurrencyInfo };

/**
 * The Exchange Rate an Order dated `endDate` in `currencyId` is saved with: the `stored` one while
 * its Unloading Date and Currency hold, otherwise the one NBP answers with.
 */
export default function useExchangeRate(stored: StoredRate, endDate: string, currencyId: number) {
  const { currencies } = useOrderData();

  // Any Currency but PLN needs its Exchange Rate, from which the Orders module works out the PLN Price.
  const currencyCode =
    currencyId === CURRENCY.PLN
      ? null
      : (currencies.find((currency) => currency.id === currencyId)?.code ?? null);
  const keepsStoredRate =
    !!stored.currencyInfo.rate && endDate === stored.endDate && currencyId === stored.currencyId;

  const { rate, isLoading, isError, error } = useCurrencyInfo(
    endDate,
    keepsStoredRate ? null : currencyCode,
  );

  if (keepsStoredRate) {
    return { currencyCode, currencyInfo: stored.currencyInfo, isLoading: false, error: null };
  }

  return {
    currencyCode,
    // Without one, not the last Currency's rate, which would price this one with it.
    currencyInfo:
      currencyCode && rate?.rates[0]
        ? toCurrencyInfo(rate)
        : orderFormOptions.defaultValues.currencyInfo,
    isLoading,
    error: isError ? error?.message || 'Wystąpił błąd podczas pobierania kursu.' : null,
  };
}
