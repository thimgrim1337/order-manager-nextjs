import { describe, expect, it } from 'vitest';
import { toPricePLN } from '@/lib/prices';

describe('Prices: toPricePLN', () => {
  it('is the Price at the Exchange Rate, to the grosz', () => {
    expect(toPricePLN('1000', '4.2')).toBe('4200.00');
    expect(toPricePLN('1234.56', '4.2513')).toBe('5248.48');
  });

  it('rounds half a grosz up, where floating point lands just below it', () => {
    // 1070 × 4.1235 = 4412.145 exactly, but 4412.1449999999995 in floating point.
    expect(toPricePLN('1070', '4.1235')).toBe('4412.15');
    expect(toPricePLN('0.30', '4.25')).toBe('1.28');
  });
});
