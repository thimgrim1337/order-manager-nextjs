import { addDays, getYesterday } from '@/lib/dates';
import type { CurrencyCode, ExchangeRate } from '@/lib/exchange-rate';
import { apiCall } from '@/lib/helpers';

type NBPRatesResponse = {
  table: string;
  currency: string;
  code: string;
  /** Oldest first. */
  rates: { no: string; effectiveDate: string; mid: number }[];
};

/** How far back from its last day the range asked of NBP reaches; longer than any run of days NBP skips. */
const LOOKBACK_DAYS = 14;

/**
 * The Exchange Rate of `code` for an Order unloading on `unloadingDate`, as of `today` (see
 * `getToday`): NBP's latest mid rate published before the Unloading Date and no later than today.
 * NBP's published dates decide which days are business days, and a rate not yet published today
 * falls back to the last.
 */
export async function getExchangeRate(
  code: CurrencyCode,
  unloadingDate: string,
  today: string,
): Promise<ExchangeRate> {
  const dayBefore = getYesterday(unloadingDate);
  const rangeEnd = dayBefore < today ? dayBefore : today;
  const rangeStart = addDays(rangeEnd, -LOOKBACK_DAYS);

  const result = await apiCall<NBPRatesResponse>(
    `https://api.nbp.pl/api/exchangerates/rates/A/${code}/${rangeStart}/${rangeEnd}/?format=json`,
  );

  if (result.type === 'error') {
    if (result.status === 404) throw new Error('Nie znaleziono kursu dla wskazanej daty.');
    throw new Error('Nie udało się pobrać kursu walut.');
  }

  const rate = result.data.rates.at(-1);
  if (!rate) throw new Error('Nie znaleziono kursu dla wskazanej daty.');

  return { date: rate.effectiveDate, rate: rate.mid.toString(), table: rate.no };
}
