import { describe, expect, it } from 'vitest';
import { getValidCurrencyDate } from '@/features/OrderForm/lib/utils';

const NO_HOLIDAYS: { endDate: string }[] = [];
// Wednesday 2026-03-25, midday in Warsaw.
const NOW = new Date('2026-03-25T12:00:00Z');

describe('getValidCurrencyDate', () => {
  it('return previous bussiness day', () => {
    expect(getValidCurrencyDate('2026-03-24', NO_HOLIDAYS, NOW)).toBe('2026-03-23');
  });

  it('return last bussiness day when day is saturday', () => {
    expect(getValidCurrencyDate('2026-03-21', NO_HOLIDAYS, NOW)).toBe('2026-03-20');
  });

  it('return last bussiness day when day is sunday', () => {
    expect(getValidCurrencyDate('2026-03-22', NO_HOLIDAYS, NOW)).toBe('2026-03-20');
  });

  it('return last bussiness day when day is a holiday', () => {
    const holidays = [{ endDate: '2021-03-24' }];
    expect(getValidCurrencyDate('2021-03-25', holidays, NOW)).toBe('2021-03-23');
  });

  it('return today when day is in future', () => {
    expect(getValidCurrencyDate('2026-03-27', NO_HOLIDAYS, NOW)).toBe('2026-03-25');
  });

  it('return last bussiness day when day is in future and today is saturday', () => {
    const saturday = new Date('2026-03-28T12:00:00Z');
    expect(getValidCurrencyDate('2026-03-30', NO_HOLIDAYS, saturday)).toBe('2026-03-27');
  });

  it('return last bussiness day when day is in future and today is a holiday', () => {
    const holidays = [{ endDate: '2026-03-25' }];
    expect(getValidCurrencyDate('2026-03-27', holidays, NOW)).toBe('2026-03-24');
  });

  it("return Warsaw's today when it is already tomorrow in Warsaw", () => {
    // 00:30 on 2026-03-25 in Warsaw, still 2026-03-24 in UTC and in the browser's timezone.
    const warsawPastMidnight = new Date('2026-03-24T23:30:00Z');
    expect(getValidCurrencyDate('2026-03-26', NO_HOLIDAYS, warsawPastMidnight)).toBe('2026-03-25');
  });

  it('return an original date when error occured', () => {
    expect(getValidCurrencyDate('2026-13-27', NO_HOLIDAYS, NOW)).toBe('2026-13-27');
  });
});
