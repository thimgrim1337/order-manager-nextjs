import 'server-only';
import { updateTag } from 'next/cache';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { customer } from '@/db/schemas';
import { CACHE_TAG } from '../consts';
import type { CustomerReadModel } from '../dal/customer.dal';
import { outcomeOf, violatedUniqueConstraint } from '../db-errors';
import { createCustomerSchema, selectCustomerSchema } from '../dto/customer.dto';
import { error, ok, type Result } from '../error';

export type CreateCustomerFailure =
  | { reason: 'InvalidData'; details: string }
  | { reason: 'CustomerNameTaken' }
  | { reason: 'CustomerTaxTaken' };

/** The refusal each unique Customer constraint stands for: the field it finds taken. */
const TAKEN_REFUSALS = {
  customers_name_unique: { reason: 'CustomerNameTaken' },
  customers_tax_unique: { reason: 'CustomerTaxTaken' },
} as const;

/** Creates a Customer, then invalidates the cached Customers. Call it from a Server Action. */
export async function createCustomer(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<CustomerReadModel, CreateCustomerFailure>> {
  const validation = createCustomerSchema.safeParse(input);
  if (!validation.success)
    return error({ reason: 'InvalidData', details: z.prettifyError(validation.error) });

  try {
    // A savepoint, so a failed write leaves a caller's transaction usable.
    const [created] = await database.transaction((trx) =>
      trx.insert(customer).values(validation.data).returning(),
    );

    updateTag(CACHE_TAG.Customers);

    return ok(selectCustomerSchema.parse(created));
  } catch (err) {
    const refusal = outcomeOf(violatedUniqueConstraint(err), TAKEN_REFUSALS);
    if (refusal) return error(refusal);
    throw err;
  }
}
