import 'server-only';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { city } from '@/db/schemas';
import { isUniqueViolation } from '../db-errors';
import { type CityDto, createCitySchema, selectCitySchema } from '../dto/city.dto';
import { error, ok, type Result } from '../error';

export type CreateCityFailure =
  | { reason: 'InvalidData'; details: string }
  | { reason: 'CityTaken' };

/** Creates a City. Call it from a Server Action. */
export async function createCityService(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<CityDto, CreateCityFailure>> {
  const validation = createCitySchema.safeParse(input);
  if (!validation.success)
    return error({ reason: 'InvalidData', details: z.prettifyError(validation.error) });

  try {
    // A savepoint, so a failed write leaves a caller's transaction usable.
    const [created] = await database.transaction((trx) =>
      trx.insert(city).values(validation.data).returning(),
    );

    return ok(selectCitySchema.parse(created));
  } catch (err) {
    if (isUniqueViolation(err)) return error({ reason: 'CityTaken' });
    throw err;
  }
}
