import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getExchangeRate } from '@/features/OrderForm/services/nbp.services';
import { worker } from '../mocks/browser';
import { fakeNbp, NBP_RATES_URL } from '../mocks/handlers';

describe('getExchangeRate', () => {
  it('takes the last rate NBP published before an Unloading Date across the year boundary', async () => {
    worker.use(
      fakeNbp([
        { no: '250/A/NBP/2026', mid: 4.21, effectiveDate: '2026-12-30' },
        { no: '251/A/NBP/2026', mid: 4.22, effectiveDate: '2026-12-31' },
        { no: '001/A/NBP/2027', mid: 4.23, effectiveDate: '2027-01-04' },
      ]),
    );

    // Monday; 2 and 3 January are a weekend, 1 January a holiday.
    expect(await getExchangeRate('EUR', '2027-01-04', '2027-01-20')).toEqual({
      table: '251/A/NBP/2026',
      rate: '4.22',
      date: '2026-12-31',
    });
  });

  it("takes the latest published rate for a future Unloading Date before today's table is out", async () => {
    worker.use(
      fakeNbp(
        [
          { no: '212/A/NBP/2026', mid: 4.24, effectiveDate: '2026-11-02' },
          { no: '213/A/NBP/2026', mid: 4.26, effectiveDate: '2026-11-03' },
        ],
        '2026-11-04',
      ),
    );

    // Wednesday 2026-11-04, before NBP publishes around noon.
    expect(await getExchangeRate('EUR', '2026-11-20', '2026-11-04')).toEqual({
      table: '213/A/NBP/2026',
      rate: '4.26',
      date: '2026-11-03',
    });
  });

  it('takes the rate from before a holiday for the Unloading Date right after it', async () => {
    worker.use(
      fakeNbp([
        { no: '002/A/NBP/2027', mid: 4.24, effectiveDate: '2027-01-05' },
        { no: '003/A/NBP/2027', mid: 4.25, effectiveDate: '2027-01-07' },
      ]),
    );

    // 6 January (Epiphany) is a holiday.
    expect(await getExchangeRate('EUR', '2027-01-07', '2027-01-20')).toEqual({
      table: '002/A/NBP/2027',
      rate: '4.24',
      date: '2027-01-05',
    });
  });

  it('fails with a message when NBP has no rate for the range', async () => {
    worker.use(fakeNbp([]));

    await expect(getExchangeRate('EUR', '2026-11-03', '2026-11-04')).rejects.toThrow(
      'Nie znaleziono kursu dla wskazanej daty.',
    );
  });

  it('fails with a message when NBP errors', async () => {
    worker.use(http.get(NBP_RATES_URL, () => HttpResponse.json({}, { status: 500 })));

    await expect(getExchangeRate('EUR', '2026-11-03', '2026-11-04')).rejects.toThrow(
      'Nie udało się pobrać kursu walut.',
    );
  });
});
