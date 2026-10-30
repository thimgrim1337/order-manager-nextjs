import 'server-only';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import type { DatabaseError } from 'pg';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { loadingPlace, order, truck, unloadingPlace } from '@/db/schemas';
import { type OrderDto, type OrderFormDto, OrderFormSchema } from './dto/order.dto';
import { error, ok, type Result } from './error';

/** The currencies table is seeded with PLN first. */
const PLN_CURRENCY_ID = 1;

export type CreateOrderFailure =
  | { reason: 'InvalidData'; details: string }
  | { reason: 'OrderNrTaken' };

/**
 * Creates an Order with its Loading and Unloading Places and assigns its Driver to its Truck,
 * in one transaction, then invalidates the cached Orders. Call it from a Server Action.
 */
export async function createOrder(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<OrderDto, CreateOrderFailure>> {
  const validation = OrderFormSchema.safeParse(input);
  if (!validation.success)
    return error({ reason: 'InvalidData', details: z.prettifyError(validation.error) });

  const { loadingPlaces, unloadingPlaces, currencyInfo, ...fields } = validation.data;

  try {
    const created = await database.transaction(async (trx) => {
      const [newOrder] = await trx
        .insert(order)
        .values({ ...fields, ...toPLN(fields.currencyId, fields.priceCurrency, currencyInfo) })
        .returning();
      await trx
        .insert(loadingPlace)
        .values(loadingPlaces.map((city) => ({ orderId: newOrder.id, placeId: city.id })));
      await trx
        .insert(unloadingPlace)
        .values(unloadingPlaces.map((city) => ({ orderId: newOrder.id, placeId: city.id })));
      await trx
        .update(truck)
        .set({ driverId: newOrder.driverId })
        .where(eq(truck.id, newOrder.truckId));

      return newOrder;
    });

    updateTag('orders');

    return ok(created);
  } catch (err) {
    if (isOrderNrTaken(err)) return error({ reason: 'OrderNrTaken' });
    throw err;
  }
}

function toPLN(
  currencyId: number,
  priceCurrency: string,
  currencyInfo: OrderFormDto['currencyInfo'],
) {
  if (currencyId === PLN_CURRENCY_ID || !currencyInfo.rate)
    return { pricePLN: priceCurrency, exchangeRate: '1', exchangeDate: null };

  return {
    pricePLN: String(Number(priceCurrency) * Number(currencyInfo.rate)),
    exchangeRate: currencyInfo.rate,
    exchangeDate: currencyInfo.date,
  };
}

function isOrderNrTaken(err: unknown) {
  const cause = err instanceof DrizzleQueryError ? (err.cause as DatabaseError) : undefined;

  return cause?.code === '23505' && cause.constraint === 'orders_customer_id_order_nr_unique';
}
