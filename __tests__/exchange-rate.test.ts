import { describe, expect, it } from 'vitest';
import { CURRENCY } from '@/lib/consts';
import {
  exchangeRateSource,
  findExchangeRate,
  fromStoredExchangeRate,
  toPricePLN,
  toStoredPrice,
} from '@/lib/exchange-rate';
import { failingNbp, fakeNbp } from './fakes/nbp';

const EUR = { id: CURRENCY.EUR, code: 'EUR' };

const EUR_RATE = { table: null, rate: '4.2', date: '2026-10-29' };

describe('Exchange Rate: exchangeRateSource', () => {
  it('has none for a PLN Order', () => {
    const stored = {
      endDate: '2026-10-30',
      currencyId: CURRENCY.PLN,
      currencyInfo: null,
    };

    expect(exchangeRateSource(stored, '2026-10-30', CURRENCY.PLN)).toEqual({ kind: 'none' });
  });

  it("keeps a foreign Order's stored rate while its Unloading Date and Currency hold", () => {
    const stored = { endDate: '2026-10-30', currencyId: CURRENCY.EUR, currencyInfo: EUR_RATE };

    expect(exchangeRateSource(stored, '2026-10-30', CURRENCY.EUR)).toEqual({
      kind: 'stored',
      currencyInfo: EUR_RATE,
    });
  });

  it('fetches a fresh rate once the Unloading Date changes', () => {
    const stored = { endDate: '2026-10-30', currencyId: CURRENCY.EUR, currencyInfo: EUR_RATE };

    expect(exchangeRateSource(stored, '2026-10-31', CURRENCY.EUR)).toEqual({ kind: 'fetch' });
  });

  it('fetches a fresh rate once the Currency changes to another foreign one', () => {
    const stored = { endDate: '2026-10-30', currencyId: CURRENCY.EUR, currencyInfo: EUR_RATE };
    const usdId = 3;

    expect(exchangeRateSource(stored, '2026-10-30', usdId)).toEqual({ kind: 'fetch' });
  });

  it('fetches a rate for a foreign Order stored without one', () => {
    const stored = {
      endDate: '2026-10-30',
      currencyId: CURRENCY.EUR,
      currencyInfo: null,
    };

    expect(exchangeRateSource(stored, '2026-10-30', CURRENCY.EUR)).toEqual({ kind: 'fetch' });
  });
});

describe('Exchange Rate: fromStoredExchangeRate', () => {
  it("is a foreign Order's stored rate and date, without NBP's table number", () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 4.2512, date: '2026-10-28' })).toEqual({
      table: null,
      rate: '4.2512',
      date: '2026-10-28',
    });
  });

  it('is none for a PLN Order, stored at a rate of 1', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.PLN, rate: 1, date: '2026-10-28' })).toBeNull();
  });

  it('is none for a foreign Order stored without a rate', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 0, date: '2026-10-28' })).toBeNull();
  });

  it('is none for a foreign Order stored without a date', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 4.2512, date: null })).toBeNull();
  });
});

describe('Exchange Rate: toStoredPrice', () => {
  it('stores a PLN Order at its own Price, a rate of 1 and no date', () => {
    expect(toStoredPrice(CURRENCY.PLN, '1000', null)).toEqual({
      pricePLN: '1000',
      exchangeRate: '1',
      exchangeDate: null,
    });
  });

  it('stores a foreign Order at its PLN Price, with the rate and its date', () => {
    expect(
      toStoredPrice(CURRENCY.EUR, '1070', {
        table: '210/A/NBP/2026',
        rate: '4.1235',
        date: '2026-10-28',
      }),
    ).toEqual({ pricePLN: '4412.15', exchangeRate: '4.1235', exchangeDate: '2026-10-28' });
  });

  it('stores nothing for a foreign Order without a rate, which would price it as PLN', () => {
    expect(toStoredPrice(CURRENCY.EUR, '1000', null)).toBeNull();
  });
});

describe('Exchange Rate: toPricePLN', () => {
  it('is the Price at the Exchange Rate, to the grosz', () => {
    expect(toPricePLN('1000', '4.2')).toBe('4200.00');
    expect(toPricePLN('1234.56', '4.2513')).toBe('5248.48');
  });

  it('rounds half a grosz up, where floating point lands just below it', () => {
    // 1070 × 4.1235 = 4412.145 exactly, but 4412.1449999999995 in floating point.
    expect(toPricePLN('1070', '4.1235')).toBe('4412.15');
    expect(toPricePLN('0.30', '4.25')).toBe('1.28');
    // 0.29 × 100 = 28.999999999999996 in floating point; 0.29 × 4.5 = 1.305 exactly.
    expect(toPricePLN('0.29', '4.5')).toBe('1.31');
  });
});

describe('Exchange Rate: findExchangeRate', () => {
  it('has none for PLN, without asking NBP', async () => {
    const nbp = fakeNbp([]);

    expect(
      await findExchangeRate(nbp, { id: CURRENCY.PLN, code: 'PLN' }, '2026-11-03', '2026-11-04'),
    ).toEqual([null, null]);
    expect(nbp.requests).toEqual([]);
  });

  it('takes the last rate NBP published before an Unloading Date across the year boundary', async () => {
    const nbp = fakeNbp([
      { no: '250/A/NBP/2026', mid: 4.21, effectiveDate: '2026-12-30' },
      { no: '251/A/NBP/2026', mid: 4.22, effectiveDate: '2026-12-31' },
      { no: '001/A/NBP/2027', mid: 4.23, effectiveDate: '2027-01-04' },
    ]);

    // Monday; 2 and 3 January are a weekend, 1 January a holiday.
    expect(await findExchangeRate(nbp, EUR, '2027-01-04', '2027-01-20')).toEqual([
      null,
      { table: '251/A/NBP/2026', rate: '4.22', date: '2026-12-31' },
    ]);
  });

  it("takes the latest published rate for a future Unloading Date before today's table is out", async () => {
    const nbp = fakeNbp(
      [
        { no: '212/A/NBP/2026', mid: 4.24, effectiveDate: '2026-11-02' },
        { no: '213/A/NBP/2026', mid: 4.26, effectiveDate: '2026-11-03' },
      ],
      '2026-11-04',
    );

    // Wednesday 2026-11-04, before NBP publishes around noon.
    expect(await findExchangeRate(nbp, EUR, '2026-11-20', '2026-11-04')).toEqual([
      null,
      { table: '213/A/NBP/2026', rate: '4.26', date: '2026-11-03' },
    ]);
  });

  it('takes the rate from before a holiday for the Unloading Date right after it', async () => {
    const nbp = fakeNbp([
      { no: '002/A/NBP/2027', mid: 4.24, effectiveDate: '2027-01-05' },
      { no: '003/A/NBP/2027', mid: 4.25, effectiveDate: '2027-01-07' },
    ]);

    // 6 January (Epiphany) is a holiday.
    expect(await findExchangeRate(nbp, EUR, '2027-01-07', '2027-01-20')).toEqual([
      null,
      { table: '002/A/NBP/2027', rate: '4.24', date: '2027-01-05' },
    ]);
  });

  it('has none when NBP published no rate in the window', async () => {
    expect(await findExchangeRate(fakeNbp([]), EUR, '2026-11-03', '2026-11-04')).toEqual([
      { reason: 'ExchangeRateNotPublished' },
      null,
    ]);
  });

  it('has none when NBP cannot be asked', async () => {
    const nbp = failingNbp({ reason: 'NbpUnavailable' });

    expect(await findExchangeRate(nbp, EUR, '2026-11-03', '2026-11-04')).toEqual([
      { reason: 'NbpUnavailable' },
      null,
    ]);
  });
});
