import { describe, expect, it } from 'vitest';
import { status } from '@/db/schemas';
import seedReference from '@/db/seeds/reference';
import { statusPresentation } from '@/features/shared/lib/status-presentation';
import { ORDER_STATUS } from '@/lib/consts';
import { withRollback } from '../db/with-rollback';

describe('statusPresentation', () => {
  it('presents every Status id', () => {
    for (const id of Object.values(ORDER_STATUS)) {
      expect(statusPresentation(id)).toMatchObject({
        label: expect.any(String),
        accessibleName: expect.any(String),
        color: expect.any(String),
        description: expect.any(String),
      });
    }
  });

  it('labels each seeded Status with its name', () =>
    withRollback(async (trx) => {
      await seedReference(trx);
      const seeded = await trx.select({ id: status.id, name: status.name }).from(status);

      expect(seeded.map(({ id }) => id).sort()).toEqual(Object.values(ORDER_STATUS).sort());
      for (const { id, name } of seeded) {
        expect(statusPresentation(id).label).toBe(name);
      }
    }));

  it('throws for an id that is no Status', () => {
    expect(() => statusPresentation(0)).toThrow('Status 0 has no presentation');
  });
});
