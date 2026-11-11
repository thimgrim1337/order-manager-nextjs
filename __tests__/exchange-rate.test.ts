import { describe, expect, it } from 'vitest';
import { CURRENCY } from '@/lib/consts';
import {
  decideExchangeRate,
  toPricePLN,
  toStoredExchangeRate,
  toStoredPrice,
} from '@/lib/exchange-rate';
import { failingNbp, fakeNbp } from './fakes/nbp';

const EUR = { id: CURRENCY.EUR, code: 'EUR' };

const EUR_RATE = { table: null, rate: '4.2', date: '2026-10-29' };

describe('Exchange Rate: toStoredExchangeRate', () => {
  const columns = {
    endDate: '2026-10-30',
    currencyId: CURRENCY.EUR,
    exchangeRate: '4.2512',
    exchangeDate: '2026-10-28',
  };

  it("is a foreign Order's stored rate and date, without NBP's table number", () => {
    expect(toStoredExchangeRate(columns)).toEqual({
      endDate: '2026-10-30',
      currencyId: CURRENCY.EUR,
      currencyInfo: { table: null, rate: '4.2512', date: '2026-10-28' },
    });
  });

  it('has no rate for a PLN Order, stored at a rate of 1', () => {
    const pln = {
      ...columns,
      currencyId: CURRENCY.PLN,
      exchangeRate: '1.0000',
      exchangeDate: null,
    };

    expect(toStoredExchangeRate(pln).currencyInfo).toBeNull();
  });

  it('has no rate for a foreign Order stored without one', () => {
    expect(toStoredExchangeRate({ ...columns, exchangeRate: null }).currencyInfo).toBeNull();
    expect(toStoredExchangeRate({ ...columns, exchangeRate: '0.0000' }).currencyInfo).toBeNull();
  });

  it('has no rate for a foreign Order stored without its date', () => {
    expect(toStoredExchangeRate({ ...columns, exchangeDate: null }).currencyInfo).toBeNull();
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

describe('Exchange Rate: decideExchangeRate', () => {
  const STORED_EUR = { endDate: '2026-10-30', currencyId: CURRENCY.EUR, currencyInfo: EUR_RATE };
  const USD = { id: 3, code: 'USD' };

  it('has none for PLN, without asking NBP', async () => {
    const nbp = fakeNbp([]);
    const pln = { id: CURRENCY.PLN, code: 'PLN' };

    expect(await decideExchangeRate(nbp, null, pln, '2026-11-03', '2026-11-04')).toEqual([
      null,
      null,
    ]);
    expect(await decideExchangeRate(nbp, STORED_EUR, pln, '2026-10-30', '2026-11-04')).toEqual([
      null,
      null,
    ]);
    expect(nbp.requests).toEqual([]);
  });

  it("keeps a foreign Order's stored rate while its Unloading Date and Currency hold, without asking NBP", async () => {
    const nbp = failingNbp({ reason: 'NbpUnavailable' });

    expect(await decideExchangeRate(nbp, STORED_EUR, EUR, '2026-10-30', '2026-11-04')).toEqual([
      null,
      EUR_RATE,
    ]);
  });

  it('answers at once, without a promise, when it needs no NBP', () => {
    const nbp = failingNbp({ reason: 'NbpUnavailable' });
    const pln = { id: CURRENCY.PLN, code: 'PLN' };

    expect(decideExchangeRate(nbp, null, pln, '2026-11-03', '2026-11-04')).toEqual([null, null]);
    expect(decideExchangeRate(nbp, STORED_EUR, EUR, '2026-10-30', '2026-11-04')).toEqual([
      null,
      EUR_RATE,
    ]);
  });

  it('asks NBP once the Unloading Date changes', async () => {
    const nbp = fakeNbp([{ no: '212/A/NBP/2026', mid: 4.24, effectiveDate: '2026-11-02' }]);

    expect(await decideExchangeRate(nbp, STORED_EUR, EUR, '2026-11-03', '2026-11-04')).toEqual([
      null,
      { table: '212/A/NBP/2026', rate: '4.24', date: '2026-11-02' },
    ]);
  });

  it('asks NBP for the new Currency once it changes to another foreign one', async () => {
    const nbp = fakeNbp([{ no: '209/A/NBP/2026', mid: 3.65, effectiveDate: '2026-10-29' }]);

    expect(await decideExchangeRate(nbp, STORED_EUR, USD, '2026-10-30', '2026-11-04')).toEqual([
      null,
      { table: '209/A/NBP/2026', rate: '3.65', date: '2026-10-29' },
    ]);
    expect(nbp.requests.map((request) => request.code)).toEqual(['USD']);
  });

  it('asks NBP for a foreign Order stored without a rate', async () => {
    const nbp = fakeNbp([{ no: '209/A/NBP/2026', mid: 4.2, effectiveDate: '2026-10-29' }]);
    const stored = { ...STORED_EUR, currencyInfo: null };

    expect(await decideExchangeRate(nbp, stored, EUR, '2026-10-30', '2026-11-04')).toEqual([
      null,
      { table: '209/A/NBP/2026', rate: '4.2', date: '2026-10-29' },
    ]);
  });

  it('takes the last rate NBP published before an Unloading Date across the year boundary', async () => {
    const nbp = fakeNbp([
      { no: '250/A/NBP/2026', mid: 4.21, effectiveDate: '2026-12-30' },
      { no: '251/A/NBP/2026', mid: 4.22, effectiveDate: '2026-12-31' },
      { no: '001/A/NBP/2027', mid: 4.23, effectiveDate: '2027-01-04' },
    ]);

    // Monday; 2 and 3 January are a weekend, 1 January a holiday.
    expect(await decideExchangeRate(nbp, null, EUR, '2027-01-04', '2027-01-20')).toEqual([
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
    expect(await decideExchangeRate(nbp, null, EUR, '2026-11-20', '2026-11-04')).toEqual([
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
    expect(await decideExchangeRate(nbp, null, EUR, '2027-01-07', '2027-01-20')).toEqual([
      null,
      { table: '002/A/NBP/2027', rate: '4.24', date: '2027-01-05' },
    ]);
  });

  it('has none when NBP published no rate in the window', async () => {
    expect(await decideExchangeRate(fakeNbp([]), null, EUR, '2026-11-03', '2026-11-04')).toEqual([
      { reason: 'ExchangeRateNotPublished' },
      null,
    ]);
  });

  it('has none when NBP cannot be asked', async () => {
    const nbp = failingNbp({ reason: 'NbpUnavailable' });

    expect(await decideExchangeRate(nbp, STORED_EUR, EUR, '2026-11-03', '2026-11-04')).toEqual([
      { reason: 'NbpUnavailable' },
      null,
    ]);
  });
});
