import { describe, expect, it } from 'vitest';
import { CURRENCY } from '@/lib/consts';
import {
  exchangeRateSource,
  fromStoredExchangeRate,
  NO_EXCHANGE_RATE,
  toPricePLN,
  toStoredPrice,
} from '@/lib/exchange-rate';

const EUR_RATE = { table: '', rate: '4.2', date: '2026-10-29' };

describe('Exchange Rate: exchangeRateSource', () => {
  it('has none for a PLN Order', () => {
    const stored = {
      endDate: '2026-10-30',
      currencyId: CURRENCY.PLN,
      currencyInfo: NO_EXCHANGE_RATE,
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
      currencyInfo: NO_EXCHANGE_RATE,
    };

    expect(exchangeRateSource(stored, '2026-10-30', CURRENCY.EUR)).toEqual({ kind: 'fetch' });
  });
});

describe('Exchange Rate: fromStoredExchangeRate', () => {
  it("is a foreign Order's stored rate and date, without NBP's table number", () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 4.2512, date: '2026-10-28' })).toEqual({
      table: '',
      rate: '4.2512',
      date: '2026-10-28',
    });
  });

  it('is none for a PLN Order, stored at a rate of 1', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.PLN, rate: 1, date: '2026-10-28' })).toEqual(
      NO_EXCHANGE_RATE,
    );
  });

  it('is none for a foreign Order stored without a rate', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 0, date: '2026-10-28' })).toEqual(
      NO_EXCHANGE_RATE,
    );
  });

  it('is none for a foreign Order stored without a date', () => {
    expect(fromStoredExchangeRate({ id: CURRENCY.EUR, rate: 4.2512, date: null })).toEqual(
      NO_EXCHANGE_RATE,
    );
  });
});

describe('Exchange Rate: toStoredPrice', () => {
  it('stores a PLN Order at its own Price, a rate of 1 and no date', () => {
    expect(toStoredPrice(CURRENCY.PLN, '1000', NO_EXCHANGE_RATE)).toEqual({
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
    expect(toStoredPrice(CURRENCY.EUR, '1000', NO_EXCHANGE_RATE)).toBeNull();
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
