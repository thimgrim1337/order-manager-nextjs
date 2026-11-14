import { describe, expect, it } from 'vitest';
import { toSearchTerm } from '@/lib/search';

describe('toSearchTerm', () => {
  it('trims the term and wraps it to match anywhere in a value', () => {
    expect(toSearchTerm('  Kowal  ')).toEqual({ text: 'Kowal', pattern: '%Kowal%' });
  });

  it('escapes %, _ and \\ so each matches only itself', () => {
    expect(toSearchTerm('A_1%\\')).toEqual({ text: 'A_1%\\', pattern: '%A\\_1\\%\\\\%' });
  });

  it.each([undefined, '', '   '])('gives no term for the empty search %j', (search) => {
    expect(toSearchTerm(search)).toBeUndefined();
  });
});
