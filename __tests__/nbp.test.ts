import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { nbpApi } from '@/lib/nbp';
import { worker } from './mocks/browser';
import { NBP_RATES_URL, nbpApiServing } from './mocks/handlers';

describe('NBP API', () => {
  it("gives a Currency's mid rates published in the range, oldest first", async () => {
    worker.use(
      nbpApiServing([
        { no: '213/A/NBP/2026', mid: 4.26, effectiveDate: '2026-11-03' },
        { no: '212/A/NBP/2026', mid: 4.24, effectiveDate: '2026-11-02' },
        { no: '211/A/NBP/2026', mid: 4.2, effectiveDate: '2026-10-30' },
      ]),
    );

    expect(await nbpApi.midRates('EUR', '2026-11-01', '2026-11-03')).toEqual([
      null,
      [
        { no: '212/A/NBP/2026', mid: 4.24, effectiveDate: '2026-11-02' },
        { no: '213/A/NBP/2026', mid: 4.26, effectiveDate: '2026-11-03' },
      ],
    ]);
  });

  it('has none published when NBP answers 404', async () => {
    worker.use(nbpApiServing([]));

    expect(await nbpApi.midRates('EUR', '2026-11-01', '2026-11-03')).toEqual([
      { reason: 'ExchangeRateNotPublished' },
      null,
    ]);
  });

  it('is unavailable when NBP errors', async () => {
    worker.use(http.get(NBP_RATES_URL, () => HttpResponse.json({}, { status: 500 })));

    expect(await nbpApi.midRates('EUR', '2026-11-01', '2026-11-03')).toEqual([
      { reason: 'NbpUnavailable' },
      null,
    ]);
  });

  it('is unavailable when NBP cannot be reached', async () => {
    worker.use(http.get(NBP_RATES_URL, () => HttpResponse.error()));

    expect(await nbpApi.midRates('EUR', '2026-11-01', '2026-11-03')).toEqual([
      { reason: 'NbpUnavailable' },
      null,
    ]);
  });
});
