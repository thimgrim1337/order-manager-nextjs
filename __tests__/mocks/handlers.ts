import { HttpResponse, http } from 'msw';

export const NBP_RATES_URL =
  'https://api.nbp.pl/api/exchangerates/rates/:table/:code/:startDate/:endDate/';

/** A mid rate NBP published in table A on `effectiveDate`. */
export type PublishedRate = { no: string; effectiveDate: string; mid: number };

const mockRate: PublishedRate = { no: '107/NBP/A', mid: 4.25, effectiveDate: '2021-01-15' };

/** NBP's answer with `rates` of `code`, oldest first. */
const ratesResponse = (code: string, rates: PublishedRate[]) =>
  HttpResponse.json({ table: 'A', currency: 'euro', code, rates });

/**
 * NBP's rates endpoint for a date range, having published `rates` (any order) for every Currency:
 * the ones in the range, oldest first, or 404 when there are none. A range ending after `today`
 * is a 400, as NBP answers one ending in the future.
 */
export const fakeNbp = (rates: PublishedRate[], today = '9999-12-31') =>
  http.get<{ code: string; startDate: string; endDate: string }>(
    NBP_RATES_URL,
    ({ params: { code, startDate, endDate } }) => {
      if (endDate > today) {
        return HttpResponse.text('400 BadRequest - Błędny zakres dat', { status: 400 });
      }

      const inRange = rates
        .filter((rate) => rate.effectiveDate >= startDate && rate.effectiveDate <= endDate)
        .sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

      if (inRange.length === 0) {
        return HttpResponse.text('404 NotFound - Not Found - Brak danych', { status: 404 });
      }

      return ratesResponse(code, inRange);
    },
  );

export const handlers = [
  // Whatever the range, NBP answers with `mockRate`.
  http.get<{ code: string }>(NBP_RATES_URL, ({ params }) => ratesResponse(params.code, [mockRate])),
];
