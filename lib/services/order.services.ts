import { DrizzleQueryError } from 'drizzle-orm';
import type { DatabaseError } from 'pg';
import z from 'zod';
import db from '@/db/db';
import { deleteOrder, deleteOrderPlaces, updateOrder } from '../dal/order.dal';
import { selectOrderSchema, updateOrderSchema } from '../dto/order.dto';
import { error, ok } from '../error';
import { getErrorDetails } from '../helpers';

export async function patchOrderService(orderId: number, rawData: unknown) {
  const validationResult = updateOrderSchema.safeParse(rawData);

  if (!validationResult.success)
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validationResult.error),
    });

  const validatedData = validationResult.data;

  try {
    const dbOrder = await updateOrder(orderId, validatedData);

    return ok(selectOrderSchema.parse(dbOrder));
  } catch (err) {
    if (err instanceof DrizzleQueryError) {
      const cause = err.cause as DatabaseError | undefined;

      if (cause?.code === '23505') {
        return error({
          reason: 'OrderExist',
        });
      }

      return error({
        reason: 'DrizzleError',
        details: getErrorDetails(err),
      });
    }

    return error({
      reason: 'UnexpectedError',
      details: getErrorDetails(err),
    });
  }
}

export async function deleteOrderService(orderId: number) {
  try {
    const dbOrder = await db.transaction(async (trx) => {
      await deleteOrderPlaces(orderId, 'loadingPlace', trx);
      await deleteOrderPlaces(orderId, 'unloadingPlace', trx);
      const order = await deleteOrder(orderId, trx);

      return order;
    });

    return ok(selectOrderSchema.parse(dbOrder));
  } catch (err) {
    if (err instanceof DrizzleQueryError) {
      return error({
        reason: 'DrizzleError',
        details: getErrorDetails(err),
      });
    }

    return error({
      reason: 'UnexpectedError',
      details: getErrorDetails(err),
    });
  }
}
