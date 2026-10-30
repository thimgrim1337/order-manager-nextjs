import 'server-only';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import type { DatabaseError } from 'pg';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { loadingPlace, order, truck, unloadingPlace } from '@/db/schemas';
import type { CityDto } from './dto/city.dto';
import { type OrderDto, OrderFormSchema, selectOrderSchema } from './dto/order.dto';
import { error, ok, type Result } from './error';

/** The currencies table is seeded with PLN first. */
const PLN_CURRENCY_ID = 1;

type InvalidData = { reason: 'InvalidData'; details: string };

export type CreateOrderFailure = InvalidData | { reason: 'OrderNrTaken' };

export type UpdateOrderFailure = CreateOrderFailure | { reason: 'NotFound' };

/**
 * Creates an Order with its Loading and Unloading Places and assigns its Driver to its Truck,
 * in one transaction, then invalidates the cached Orders. Call it from a Server Action.
 */
export async function createOrder(
  database: db | dbTransaction,
  input: unknown,
): Promise<Result<OrderDto, CreateOrderFailure>> {
  const [invalid, form] = parseOrderForm(input);
  if (invalid) return error(invalid);

  const { loadingPlaces, unloadingPlaces, fields } = form;

  try {
    const created = await database.transaction(async (trx) => {
      const [newOrder] = await trx.insert(order).values(fields).returning();
      await insertPlaces(trx, newOrder.id, loadingPlaces, unloadingPlaces);
      await assignDriverToTruck(trx, newOrder);

      return newOrder;
    });

    updateTag('orders');

    return ok(selectOrderSchema.parse(created));
  } catch (err) {
    if (isOrderNrTaken(err)) return error({ reason: 'OrderNrTaken' });
    throw err;
  }
}

/**
 * Updates an Order, replaces its Loading and Unloading Places, re-assigns its Driver to its Truck
 * and recomputes its PLN price, in one transaction, then invalidates the cached Orders.
 * Call it from a Server Action.
 */
export async function updateOrder(
  database: db | dbTransaction,
  orderId: number,
  input: unknown,
): Promise<Result<OrderDto, UpdateOrderFailure>> {
  const [invalid, form] = parseOrderForm(input);
  if (invalid) return error(invalid);

  const { loadingPlaces, unloadingPlaces, fields } = form;

  try {
    const updated = await database.transaction(async (trx) => {
      const [updatedOrder] = await trx
        .update(order)
        .set(fields)
        .where(eq(order.id, orderId))
        .returning();
      if (!updatedOrder) return null;

      await trx.delete(loadingPlace).where(eq(loadingPlace.orderId, orderId));
      await trx.delete(unloadingPlace).where(eq(unloadingPlace.orderId, orderId));
      await insertPlaces(trx, orderId, loadingPlaces, unloadingPlaces);
      await assignDriverToTruck(trx, updatedOrder);

      return updatedOrder;
    });
    if (!updated) return error({ reason: 'NotFound' });

    updateTag('orders');

    return ok(selectOrderSchema.parse(updated));
  } catch (err) {
    if (isOrderNrTaken(err)) return error({ reason: 'OrderNrTaken' });
    throw err;
  }
}

/** Validates the Order form and turns its price into the Order's PLN price, rate and date. */
function parseOrderForm(input: unknown) {
  const validation = OrderFormSchema.safeParse(input);
  if (!validation.success)
    return error<'InvalidData', InvalidData>({
      reason: 'InvalidData',
      details: z.prettifyError(validation.error),
    });

  const { loadingPlaces, unloadingPlaces, currencyInfo, ...fields } = validation.data;

  if (fields.currencyId === PLN_CURRENCY_ID)
    return ok({
      loadingPlaces,
      unloadingPlaces,
      fields: { ...fields, pricePLN: fields.priceCurrency, exchangeRate: '1', exchangeDate: null },
    });

  // Saving a foreign price without its rate would store it as if it were PLN.
  if (!currencyInfo.rate)
    return error<'InvalidData', InvalidData>({
      reason: 'InvalidData',
      details: 'Brak kursu waluty.',
    });

  return ok({
    loadingPlaces,
    unloadingPlaces,
    fields: {
      ...fields,
      pricePLN: String(Number(fields.priceCurrency) * Number(currencyInfo.rate)),
      exchangeRate: currencyInfo.rate,
      exchangeDate: currencyInfo.date,
    },
  });
}

/** One transaction is one client, so the inserts run one after another. */
async function insertPlaces(
  trx: dbTransaction,
  orderId: number,
  loadingPlaces: CityDto[],
  unloadingPlaces: CityDto[],
) {
  await trx
    .insert(loadingPlace)
    .values(loadingPlaces.map((city) => ({ orderId, placeId: city.id })));
  await trx
    .insert(unloadingPlace)
    .values(unloadingPlaces.map((city) => ({ orderId, placeId: city.id })));
}

async function assignDriverToTruck(
  trx: dbTransaction,
  { driverId, truckId }: { driverId: number; truckId: number },
) {
  await trx.update(truck).set({ driverId }).where(eq(truck.id, truckId));
}

function isOrderNrTaken(err: unknown) {
  const cause = err instanceof DrizzleQueryError ? (err.cause as DatabaseError) : undefined;

  return cause?.code === '23505' && cause.constraint === 'orders_customer_id_order_nr_unique';
}
