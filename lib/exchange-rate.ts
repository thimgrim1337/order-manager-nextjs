import type { CurrencyReadModel } from '@/lib/dal/currency.dal';
import { CURRENCY } from './consts';
import { addDays, getYesterday } from './dates';
import { error, ok, type Result } from './error';
import type { Nbp } from './nbp';

/**
 * An Exchange Rate: NBP's mid rate, its date and its table number, which an Order's stored rate
 * comes without. A PLN Order has none (null).
 */
export type ExchangeRate = {
  date: string;
  table: string | null;
  rate: string;
};

/** A PLN Order has no Exchange Rate; any other Currency needs one. */
export const hasExchangeRate = (currencyId: number) => currencyId !== CURRENCY.PLN;

/** Why a foreign Currency has no Exchange Rate: NBP published none in the window, or could not be asked. */
export type NoExchangeRate = { reason: 'ExchangeRateNotPublished' } | { reason: 'NbpUnavailable' };

/** The Exchange Rate an Order is saved with, or why a foreign Currency has none. */
type ExchangeRateDecision = Result<ExchangeRate | null, NoExchangeRate>;

/** How far back from its last day the range asked of NBP reaches; longer than any run of days NBP skips. */
const LOOKBACK_DAYS = 14;

/**
 * NBP's Exchange Rate of the foreign `currency` for an Order unloading on `unloadingDate`, as of
 * `today`: its latest mid rate published before the Unloading Date and no later than today. NBP's
 * published dates decide which days are business days, and a rate not yet published today falls
 * back to the last.
 */
async function askNbpForExchangeRate(
  nbp: Nbp,
  currency: CurrencyReadModel,
  unloadingDate: string,
  today: string,
): Promise<ExchangeRateDecision> {
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

/** The Unloading Date and Currency an Order's Exchange Rate was stored for, with that rate. */
export type StoredExchangeRate = {
  endDate: string;
  currencyId: number;
  currencyInfo: ExchangeRate | null;
};

/** An Order's stored Unloading Date, Currency and Exchange Rate columns. */
type StoredExchangeRateColumns = {
  endDate: string;
  currencyId: number;
  exchangeRate: string | null;
  exchangeDate: string | null;
};

/**
 * The Exchange Rate an Order stored with `columns` keeps while edited: none for PLN, or for a
 * foreign Order stored without a rate or its date. NBP's table number isn't stored.
 */
export function toStoredExchangeRate({
  endDate,
  currencyId,
  exchangeRate,
  exchangeDate,
}: StoredExchangeRateColumns): StoredExchangeRate {
  const rate = Number(exchangeRate);

  return {
    endDate,
    currencyId,
    currencyInfo:
      hasExchangeRate(currencyId) && rate && exchangeDate
        ? { table: null, rate: String(rate), date: exchangeDate }
        : null,
  };
}

/**
 * The Exchange Rate an Order in `currency` unloading on `unloadingDate` is saved with, as of
 * `today` (see `getToday`): none for PLN; the `stored` one (none for a new Order) while its
 * Unloading Date and Currency hold; otherwise the one `nbp` gives, or why there is none.
 *
 * Decided without asking NBP, it answers at once rather than with a promise, so the Order form
 * can preview it from its first render.
 */
export function decideExchangeRate(
  nbp: Nbp,
  stored: StoredExchangeRate | null,
  currency: CurrencyReadModel,
  unloadingDate: string,
  today: string,
): ExchangeRateDecision | Promise<ExchangeRateDecision> {
  if (!hasExchangeRate(currency.id)) return ok(null);

  if (stored?.currencyInfo && unloadingDate === stored.endDate && currency.id === stored.currencyId)
    return ok(stored.currencyInfo);

  return askNbpForExchangeRate(nbp, currency, unloadingDate, today);
}

/**
 * The PLN Price, Exchange Rate and its date an Order priced at `price` in `currencyId` is stored
 * with, at `currencyInfo`; null for a foreign Currency without a rate.
 */
export function toStoredPrice(
  currencyId: number,
  price: string,
  currencyInfo: ExchangeRate | null,
): { pricePLN: string; exchangeRate: string; exchangeDate: string | null } | null {
  if (!hasExchangeRate(currencyId))
    return { pricePLN: price, exchangeRate: '1', exchangeDate: null };
  if (!currencyInfo) return null;

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
