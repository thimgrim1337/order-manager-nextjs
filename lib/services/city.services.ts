import 'server-only';
import { updateTag } from 'next/cache';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { city } from '@/db/schemas';
import { CACHE_TAG } from '../consts';
import { type CityReadModel, findCity } from '../dal/city.dal';
import { isUniqueViolation } from '../db-errors';
import { createCitySchema } from '../dto/city.dto';
import { error, ok, type Result } from '../error';

export type CreateCityFailure =
  | { reason: 'InvalidData'; details: string }
  | { reason: 'CityTaken' };

/** Creates a City, returned with its Country, then invalidates the cached Cities. Call it from a Server Action. */
export async function createCity(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<CityReadModel, CreateCityFailure>> {
  const validation = createCitySchema.safeParse(input);
  if (!validation.success)
    return error({ reason: 'InvalidData', details: z.prettifyError(validation.error) });

  try {
    // A savepoint, so a failed write leaves a caller's transaction usable.
    const created = await database.transaction(async (trx) => {
      const [inserted] = await trx.insert(city).values(validation.data).returning({ id: city.id });
      const found = inserted && (await findCity(trx, inserted.id));
      if (!found) throw new Error('Inserting a City returned no row.');
      return found;
    });

    updateTag(CACHE_TAG.Cities);

    return ok(created);
  } catch (err) {
    if (isUniqueViolation(err)) return error({ reason: 'CityTaken' });
    throw err;
  }
}
