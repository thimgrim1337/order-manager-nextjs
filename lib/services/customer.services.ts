import {
  createCustomerSchema,
  selectCustomerSchema,
} from '../dto/customer.dto';
import { error, ok } from '../error';
import { checkIfCustomerExist, createCustomer } from '../dal/customer.dal.';
import z from 'zod';

export async function createCustomerService(rawData: unknown) {
  const validationResult = createCustomerSchema.safeParse(rawData);
  if (!validationResult.success)
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validationResult.error),
    });

  const isCustomerExist = await checkIfCustomerExist(validationResult.data);

  if (isCustomerExist)
    return error({
      reason: 'CustomerExist',
    });

  try {
    const dbCustomer = await createCustomer(validationResult.data);

    return ok(selectCustomerSchema.parse(dbCustomer));
  } catch (err) {
    return error({
      reason: 'UnexpectedError',
      details: err,
    });
  }
}
