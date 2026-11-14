import { inArray } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { city, country } from '@/db/schemas';
import { inPolishOrder } from '@/lib/polish-order';
import { withRollback } from './db/with-rollback';

describe('inPolishOrder', () => {
  it('orders a column in Polish alphabetical order, each Polish letter after its Latin one', () =>
    withRollback(async (trx) => {
      const [poland] = await trx.insert(country).values({ name: 'Polska', code: 'PL' }).returning();
      const names = ['Żagań', 'Zabrze', 'Łódź', 'lublin', 'Ćmielów', 'Czersk', 'Mława'];
      const seeded = await trx
        .insert(city)
        .values(names.map((name, i) => ({ name, postal: `00-${100 + i}`, countryId: poland.id })))
        .returning();

      const ordered = await trx
        .select({ name: city.name })
        .from(city)
        .where(
          inArray(
            city.id,
            seeded.map(({ id }) => id),
          ),
        )
        .orderBy(inPolishOrder(city.name));

      expect(ordered.map(({ name }) => name)).toEqual([
        'Czersk',
        'Ćmielów',
        'lublin',
        'Łódź',
        'Mława',
        'Zabrze',
        'Żagań',
      ]);
    }));
});
