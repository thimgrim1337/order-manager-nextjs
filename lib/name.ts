import z from 'zod';
import { ZOD_ERROR_MESSAGES } from './consts';

/**
 * A City or Customer name as typed, with runs of whitespace as one space, so they don't tell two
 * names apart; letter case doesn't either, left to the unique `LOWER(name)` indexes.
 */
export function nameSchema(max: number, maxError?: string) {
  return z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .trim()
    .overwrite((name) => name.replace(/\s+/g, ' '))
    .min(1, { error: ZOD_ERROR_MESSAGES.FieldRequired })
    .max(max, { error: maxError });
}
