import { DrizzleQueryError } from 'drizzle-orm';
import type { DatabaseError } from 'pg';

const UNIQUE_VIOLATION = '23505';
const FOREIGN_KEY_VIOLATION = '23503';

/** The unique constraint a query failed on, or none when it failed otherwise. */
export function violatedUniqueConstraint(err: unknown) {
  return violatedConstraint(err, UNIQUE_VIOLATION);
}

/** The foreign key constraint a query failed on, or none when it failed otherwise. */
export function violatedForeignKey(err: unknown) {
  return violatedConstraint(err, FOREIGN_KEY_VIOLATION);
}

/** The outcome `outcomes` gives a violated constraint, or none when it names no such constraint. */
export function outcomeOf<TOutcomes extends Record<string, unknown>>(
  constraint: string | undefined,
  outcomes: TOutcomes,
): TOutcomes[keyof TOutcomes] | undefined {
  if (constraint && Object.hasOwn(outcomes, constraint)) {
    return outcomes[constraint as keyof TOutcomes];
  }
}

function violatedConstraint(err: unknown, code: string) {
  const cause = databaseError(err);

  return cause?.code === code ? cause.constraint : undefined;
}

function databaseError(err: unknown) {
  return err instanceof DrizzleQueryError ? (err.cause as DatabaseError | undefined) : undefined;
}
