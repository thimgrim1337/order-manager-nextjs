import { describe, expect, it } from 'vitest';
import { taxNumberSchema } from '@/lib/tax-number';

const parse = (typed: string) => {
  const result = taxNumberSchema.safeParse(typed);
  return result.success ? { tax: result.data } : { error: result.error.issues[0]?.message };
};

describe('taxNumberSchema', () => {
  it.each([
    { typed: '7743241555', tax: '7743241555' },
    { typed: 'PL7743241555', tax: '7743241555' },
    { typed: ' pl 774-324-15.55 ', tax: '7743241555' },
    { typed: 'de 123.456-789', tax: 'DE123456789' },
    { typed: 'NL851725640B01', tax: 'NL851725640B01' },
    { typed: 'CZ12', tax: 'CZ12' },
    { typed: 'LT123456789012', tax: 'LT123456789012' },
  ])('reads $typed as the Tax Number $tax', ({ typed, tax }) => {
    expect(parse(typed)).toEqual({ tax });
  });

  it.each([
    { typed: '7743241556', why: 'a wrong check digit' },
    { typed: '1000000160', why: 'a checksum of 10, which no check digit matches' },
    { typed: '774324155', why: 'nine digits' },
    { typed: '77432415551', why: 'eleven digits' },
    { typed: 'PL774324155X', why: 'a PL prefix on something other than ten digits' },
  ])('refuses a Polish NIP with $why', ({ typed }) => {
    expect(parse(typed)).toEqual({ error: 'Nieprawidłowy NIP.' });
  });

  it.each([
    { typed: 'DE', why: 'a prefix alone' },
    { typed: 'DE1', why: 'one character after its prefix' },
    { typed: 'LT1234567890123', why: 'thirteen characters after its prefix' },
    { typed: 'DE12345678_9', why: 'a character other than a letter or digit' },
  ])('refuses a foreign VAT number with $why', ({ typed }) => {
    expect(parse(typed)).toEqual({ error: 'Nieprawidłowy numer VAT.' });
  });

  it('refuses an empty Tax Number as required', () => {
    expect(parse('  ')).not.toHaveProperty('tax');
  });
});
