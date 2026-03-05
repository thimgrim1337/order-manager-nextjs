import { getValidCurrencyDate } from '@/lib/utils';
import { it, expect, describe, vi, MockedFunction } from 'vitest';
import * as dateUtils from '@/lib/dates';

vi.mock('@/lib/dates');

describe('getValidCurrencyDate', () => {
  it('should return yesterday date for regular workday', () => {
    (
      dateUtils.getYesterday as MockedFunction<typeof dateUtils.getYesterday>
    ).mockReturnValue('2026-02-19');
    (
      dateUtils.isWeekend as MockedFunction<typeof dateUtils.isWeekend>
    ).mockReturnValue(false);
    (
      dateUtils.isFuture as MockedFunction<typeof dateUtils.isFuture>
    ).mockReturnValue(false);

    const result = getValidCurrencyDate('2026-02-20', []);

    expect(result).toBe('2026-02-19');
  });

  it('skips weekends and return last workday', () => {
    (dateUtils.getYesterday as MockedFunction<typeof dateUtils.getYesterday>)
      .mockReturnValueOnce('2026-02-21')
      .mockReturnValueOnce('2026-02-20');

    (
      dateUtils.isWeekend as MockedFunction<typeof dateUtils.isWeekend>
    ).mockReturnValueOnce(true);
    (
      dateUtils.isWeekend as MockedFunction<typeof dateUtils.isWeekend>
    ).mockReturnValueOnce(false);

    (
      dateUtils.isFuture as MockedFunction<typeof dateUtils.isFuture>
    ).mockReturnValue(false);

    const result = getValidCurrencyDate('2026-06-22', []);

    expect(result).toBe('2026-02-20');
  });
});
