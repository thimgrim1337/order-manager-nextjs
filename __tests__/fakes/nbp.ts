import { error, ok } from '@/lib/error';
import type { NoExchangeRate } from '@/lib/exchange-rate';
import type { Nbp, PublishedRate } from '@/lib/nbp';

/** An NBP that was asked for `code`'s rates from `from` to `to`. */
type Request = { code: string; from: string; to: string };

/**
 * NBP having published `rates` (any order) for every Currency: the ones in the asked range, oldest
 * first, or none published. A range ending after `today` fails, as NBP refuses one ending in the
 * future. Records each request in `requests`.
 */
export function fakeNbp(rates: PublishedRate[], today = '9999-12-31') {
  const requests: Request[] = [];

  const nbp: Nbp = {
    async midRates(code, from, to) {
      requests.push({ code, from, to });
      if (to > today) return error({ reason: 'NbpUnavailable' });

      const inRange = rates
        .filter((rate) => rate.effectiveDate >= from && rate.effectiveDate <= to)
        .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));
      if (inRange.length === 0) return error({ reason: 'ExchangeRateNotPublished' });

      return ok(inRange);
    },
  };

  return Object.assign(nbp, { requests });
}

/** An NBP that answers every request with `failure`. */
export function failingNbp(failure: NoExchangeRate): Nbp {
  return { midRates: async () => error(failure) };
}
