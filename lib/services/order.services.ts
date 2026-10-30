import { DrizzleQueryError } from 'drizzle-orm';
import db from '@/db/db';
import { deleteOrder, deleteOrderPlaces } from '../dal/order.dal';
import { selectOrderSchema } from '../dto/order.dto';
import { error, ok } from '../error';
import { getErrorDetails } from '../helpers';

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
