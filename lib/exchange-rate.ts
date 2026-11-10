import type { CurrencyReadModel } from '@/lib/dal/currency.dal';
import { CURRENCY } from './consts';
import { addDays, getYesterday } from './dates';
import { error, ok, type Result } from './error';
import type { Nbp } from './nbp';

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

/** Why a foreign Currency has no Exchange Rate: NBP published none in the window, or could not be asked. */
export type NoExchangeRate = { reason: 'ExchangeRateNotPublished' } | { reason: 'NbpUnavailable' };

/** How far back from its last day the range asked of NBP reaches; longer than any run of days NBP skips. */
const LOOKBACK_DAYS = 14;

/**
 * The Exchange Rate of `currency` for an Order unloading on `unloadingDate`, as of `today` (see
 * `getToday`): none for PLN, without asking NBP; otherwise NBP's latest mid rate published before
 * the Unloading Date and no later than today. NBP's published dates decide which days are business
 * days, and a rate not yet published today falls back to the last.
 */
export async function findExchangeRate(
  nbp: Nbp,
  currency: CurrencyReadModel,
  unloadingDate: string,
  today: string,
): Promise<Result<ExchangeRate, NoExchangeRate>> {
  if (!hasExchangeRate(currency.id)) return ok(NO_EXCHANGE_RATE);

  const dayBefore = getYesterday(unloadingDate);
  const rangeEnd = dayBefore < today ? dayBefore : today;

  const [failure, rates] = await nbp.midRates(
    currency.code,
    addDays(rangeEnd, -LOOKBACK_DAYS),
    rangeEnd,
  );
  if (failure) return error(failure);

  const rate = rates.at(-1);
  if (!rate) return error({ reason: 'ExchangeRateNotPublished' });

  return ok({ date: rate.effectiveDate, rate: rate.mid.toString(), table: rate.no });
}

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
