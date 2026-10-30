import { DrizzleQueryError } from 'drizzle-orm';
import type { DatabaseError } from 'pg';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

/** Whether a query failed on a unique constraint: the given one, or any when none is given. */
export function isUniqueViolation(err: unknown, constraint?: string) {
  return violates(err, UNIQUE_VIOLATION, constraint);
}

/** Whether a query failed on the given foreign key constraint. */
export function isForeignKeyViolation(err: unknown, constraint: string) {
  return violates(err, FOREIGN_KEY_VIOLATION, constraint);
}

function violates(err: unknown, code: string, constraint?: string) {
  const cause =
    err instanceof DrizzleQueryError ? (err.cause as DatabaseError | undefined) : undefined;

  return cause?.code === code && (constraint === undefined || cause.constraint === constraint);
}
