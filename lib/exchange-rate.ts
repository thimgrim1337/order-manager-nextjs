import type { CurrencyReadModel } from '@/lib/dal/currency.dal';
import { CURRENCY } from './consts';

/** A Currency's code, as the NBP API takes it. */
export type CurrencyCode = CurrencyReadModel['code'];

/** An Exchange Rate as the Order form submits it: NBP's table number, mid rate and its date. */
export type ExchangeRate = {
  date: string;
  table: string;
  rate: string;
};

/** No Exchange Rate: a PLN Order's, or a foreign one's not yet fetched. */
export const NO_EXCHANGE_RATE: ExchangeRate = { table: '', rate: '', date: '' };

/** A PLN Order has no Exchange Rate; any other Currency needs one. */
const hasExchangeRate = (currencyId: number) => currencyId !== CURRENCY.PLN;

/** The Unloading Date and Currency an Order's Exchange Rate was stored for, with that rate, as the form starts with them. */
export type StoredExchangeRate = {
  endDate: string;
  currencyId: number;
  currencyInfo: ExchangeRate;
};

/**
 * Where the Exchange Rate of an Order dated `endDate` in `currencyId` comes from: none for PLN, the
 * `stored` one while its Unloading Date and Currency hold, otherwise a freshly fetched one.
 */
export function exchangeRateSource(
  stored: StoredExchangeRate,
  endDate: string,
  currencyId: number,
): { kind: 'none' } | { kind: 'stored'; currencyInfo: ExchangeRate } | { kind: 'fetch' } {
  if (!hasExchangeRate(currencyId)) return { kind: 'none' };

  const keepsStored =
    !!stored.currencyInfo.rate && endDate === stored.endDate && currencyId === stored.currencyId;
  if (keepsStored) return { kind: 'stored', currencyInfo: stored.currencyInfo };

  return { kind: 'fetch' };
}

/** An Order's stored Currency and Exchange Rate, as the Order read model carries them. */
type StoredCurrency = { id: number; rate: number; date: string | null };

/** The Exchange Rate the Order form starts with for an Order stored in `currency`; NBP's table number isn't stored. */
export const fromStoredExchangeRate = ({ id, rate, date }: StoredCurrency): ExchangeRate =>
  hasExchangeRate(id) && rate && date ? { table: '', rate: String(rate), date } : NO_EXCHANGE_RATE;

/**
 * The PLN Price, Exchange Rate and its date an Order priced at `price` in `currencyId` is stored
 * with, at the submitted `currencyInfo`; null for a foreign Currency submitted without a rate.
 */
export function toStoredPrice(
  currencyId: number,
  price: string,
  currencyInfo: ExchangeRate,
): { pricePLN: string; exchangeRate: string; exchangeDate: string | null } | null {
  if (!hasExchangeRate(currencyId))
    return { pricePLN: price, exchangeRate: '1', exchangeDate: null };
  if (!currencyInfo.rate) return null;

  return {
    pricePLN: toPricePLN(price, currencyInfo.rate),
    exchangeRate: currencyInfo.rate,
    exchangeDate: currencyInfo.date,
  };
}

/**
 * The PLN Price of `price` at the Exchange Rate `rate`, to the grosz, half a grosz rounded up.
 *
 * Works in whole grosze and ten-thousandths of the rate, the scales the Order stores them at,
 * so the product is exact: in floating point 1070 × 4.1235 lands just below 4412.145.
 */
export function toPricePLN(price: string, rate: string) {
  const grosze = Math.round(Number(price) * 100);
  const rateTenThousandths = Math.round(Number(rate) * 10_000);

  return (Math.round((grosze * rateTenThousandths) / 10_000) / 100).toFixed(2);
}
