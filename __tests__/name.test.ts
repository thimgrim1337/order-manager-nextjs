import { describe, expect, it } from 'vitest';
import { nameSchema } from '@/lib/name';

const NBSP = String.fromCharCode(0xa0);

describe('nameSchema', () => {
  it.each([
    { typed: '  Nowy Targ  ', name: 'Nowy Targ' },
    { typed: 'Nowy   Targ', name: 'Nowy Targ' },
    { typed: `Nowy${NBSP}${NBSP}Targ`, name: 'Nowy Targ' },
    { typed: 'Nowy\tTarg', name: 'Nowy Targ' },
    { typed: 'ŁÓDŹ', name: 'ŁÓDŹ' },
  ])('reads $typed as $name', ({ typed, name }) => {
    expect(nameSchema(20).parse(typed)).toBe(name);
  });

  it('counts its length once spaces are collapsed, refusing a longer one with its message', () => {
    expect(nameSchema(9).safeParse('Nowy    Targ').success).toBe(true);
    expect(nameSchema(8, 'Za długa.').safeParse('Nowy Targ').error?.issues[0]?.message).toBe(
      'Za długa.',
    );
  });

  it('refuses an empty name as required', () => {
    expect(nameSchema(20).safeParse('   ').success).toBe(false);
  });
});
