import { error, ok, type Result } from './error';
import type { NoExchangeRate } from './exchange-rate';
import { apiCall } from './helpers';

/** A mid rate NBP published in its table A numbered `no` on `effectiveDate`. */
export type PublishedRate = { no: string; effectiveDate: string; mid: number };

/** Where the Exchange Rate module reads NBP's published mid rates from. */
export type Nbp = {
  /** The mid rates of `code` NBP published from `from` to `to` (`yyyy-MM-dd`, both included), oldest first. */
  midRates(
    code: string,
    from: string,
    to: string,
  ): Promise<Result<PublishedRate[], NoExchangeRate>>;
};

type NBPRatesResponse = {
  table: string;
  currency: string;
  code: string;
  /** Oldest first. */
  rates: PublishedRate[];
};

/** NBP's public API, from the browser or the server. */
export const nbpApi: Nbp = {
  async midRates(code, from, to) {
    try {
      const result = await apiCall<NBPRatesResponse>(
        `https://api.nbp.pl/api/exchangerates/rates/A/${code}/${from}/${to}/?format=json`,
      );
      if (result.type === 'error')
        return error({
          reason: result.status === 404 ? 'ExchangeRateNotPublished' : 'NbpUnavailable',
        });

      return ok(result.data.rates);
    } catch {
      // Unreachable, or not answering with JSON.
      return error({ reason: 'NbpUnavailable' });
    }
  },
};
