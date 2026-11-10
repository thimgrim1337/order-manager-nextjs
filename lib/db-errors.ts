import { DrizzleQueryError } from 'drizzle-orm';
import type { DatabaseError } from 'pg';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a query failed on a unique constraint: the given one, or any when none is given. */
export function isUniqueViolation(err: unknown, constraint?: string) {
  return violates(err, UNIQUE_VIOLATION, constraint);
}

/** The foreign key constraint a query failed on, or none when it failed otherwise. */
export function violatedForeignKey(err: unknown) {
  const cause = databaseError(err);

  return cause?.code === FOREIGN_KEY_VIOLATION ? cause.constraint : undefined;
}

function databaseError(err: unknown) {
  return err instanceof DrizzleQueryError ? (err.cause as DatabaseError | undefined) : undefined;
}

function violates(err: unknown, code: string, constraint?: string) {
  const cause = databaseError(err);

  return cause?.code === code && (constraint === undefined || cause.constraint === constraint);
}
