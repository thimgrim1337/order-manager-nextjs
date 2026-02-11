import z from 'zod';
import {
  createCustomerSchema,
  selectCustomerSchema,
} from '../dto/customer.dto';
import { error, ok } from '../error';
import { checkIfCustomerExist, createCustomer } from '../dal/customer.dal.';

export async function createCustomerService(rawData: unknown) {
  const validationResult = createCustomerSchema.safeParse(rawData);

  if (!validationResult.success) {
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validationResult.error),
    });
  }
  const dto = validationResult.data;

  const isCustomerExist = await checkIfCustomerExist(dto);

  if (isCustomerExist)
    return error({
      reason: 'CustomerExist',
    });

  try {
    const dbCustomer = await createCustomer(dto);

    return ok(selectCustomerSchema.parse(dbCustomer));
  } catch (err) {
    return error({
      reason: 'UnexpectedError',
      details: err,
    });
  }
}
