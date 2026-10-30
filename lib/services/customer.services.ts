import 'server-only';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { customer } from '@/db/schemas';
import { isUniqueViolation } from '../db-errors';
import { type CustomerDto, createCustomerSchema, selectCustomerSchema } from '../dto/customer.dto';
import { error, ok, type Result } from '../error';

export type CreateCustomerFailure =
  | { reason: 'InvalidData'; details: string }
  | { reason: 'CustomerTaken' };

/** Creates a Customer. Call it from a Server Action. */
export async function createCustomerService(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<CustomerDto, CreateCustomerFailure>> {
  const validation = createCustomerSchema.safeParse(input);
  if (!validation.success)
    return error({ reason: 'InvalidData', details: z.prettifyError(validation.error) });

  try {
    // A savepoint, so a failed write leaves a caller's transaction usable.
    const [created] = await database.transaction((trx) =>
      trx.insert(customer).values(validation.data).returning(),
    );

    return ok(selectCustomerSchema.parse(created));
  } catch (err) {
    if (isUniqueViolation(err)) return error({ reason: 'CustomerTaken' });
    throw err;
  }
}
