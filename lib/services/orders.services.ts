import 'server-only';
import { eq } from 'drizzle-orm';
import { updateTag } from 'next/cache';
import z from 'zod';
import type { db, dbTransaction } from '@/db/db';
import { loadingPlace, order, truck, unloadingPlace } from '@/db/schemas';
import { CACHE_TAG } from '../consts';
import { findCurrency } from '../dal/currency.dal';
import { findOrderExchangeRate } from '../dal/order.dal';
import { getToday } from '../dates';
import { isForeignKeyViolation, isUniqueViolation } from '../db-errors';
import type { CityDto } from '../dto/city.dto';
import {
  type OrderDto,
  type OrderFormDto,
  OrderFormSchema,
  selectOrderSchema,
} from '../dto/order.dto';
import { error, ok, type Result } from '../error';
import {
  exchangeRateSource,
  findExchangeRate,
  fromStoredExchangeRate,
  type NoExchangeRate,
  type StoredExchangeRate,
  toStoredPrice,
} from '../exchange-rate';
import type { Nbp } from '../nbp';

type InvalidData = { reason: 'InvalidData'; details: string };

const invalidData = (details: string) =>
  error<'InvalidData', InvalidData>({ reason: 'InvalidData', details });

type OrderNrTaken = { reason: 'OrderNrTaken' };

export type CreateOrderFailure = InvalidData | OrderNrTaken | NoExchangeRate;

type NotFound = { reason: 'NotFound' };

export type UpdateOrderFailure = InvalidData | OrderNrTaken | NotFound | NoExchangeRate;

export type ChangeOrderStatusFailure = InvalidData | NotFound | { reason: 'UnknownStatus' };

export type RemoveOrderFailure = InvalidData | NotFound;

/** The cache tags each Order write invalidates: saving an Order also assigns its Driver to its Truck. */
const INVALIDATED_TAGS = {
  create: [CACHE_TAG.Orders, CACHE_TAG.Trucks],
  update: [CACHE_TAG.Orders, CACHE_TAG.Trucks],
  changeStatus: [CACHE_TAG.Orders],
  remove: [CACHE_TAG.Orders],
} as const;

/**
 * Creates an Order with its Loading and Unloading Places and assigns its Driver to its Truck,
 * in one transaction, then invalidates the cached Orders and Trucks. A foreign-Currency Order is
 * priced at the Exchange Rate `nbp` gives as of the company's day at `now`. Call it from a Server
 * Action.
 */
export async function createOrder(
  database: db | dbTransaction,
  input: unknown,
  nbp: Nbp,
  now?: Date,
): Promise<Result<OrderDto, CreateOrderFailure>> {
  const [invalid, form] = validateOrderForm(input);
  if (invalid) return error(invalid);

  // Priced before the transaction, so it holds no connection while NBP is asked.
  const [unpriced, priced] = await priceOrder(database, form, nbp, now);
  if (unpriced) return error(unpriced);
  const { loadingPlaces, unloadingPlaces, fields } = priced;

  try {
    const created = await database.transaction(async (trx) => {
      const [newOrder] = await trx.insert(order).values(fields).returning();
      if (!newOrder) throw new Error('Inserting an Order returned no row.');
      await insertPlaces(trx, newOrder.id, loadingPlaces, unloadingPlaces);
      await assignDriverToTruck(trx, newOrder);

      return newOrder;
    });

    invalidate('create');

    return ok(selectOrderSchema.parse(created));
  } catch (err) {
    if (isOrderNrTaken(err)) return error({ reason: 'OrderNrTaken' });
    throw err;
  }
}

/**
 * Updates an Order, replaces its Loading and Unloading Places, re-assigns its Driver to its Truck
 * and recomputes its PLN price, in one transaction, then invalidates the cached Orders and Trucks.
 * A foreign-Currency Order keeps its stored Exchange Rate while its Unloading Date and Currency
 * hold; otherwise it is priced at the one `nbp` gives as of the company's day at `now`.
 * Call it from a Server Action.
 */
export async function updateOrder(
  database: db | dbTransaction,
  orderIdInput: unknown,
  input: unknown,
  nbp: Nbp,
  now?: Date,
): Promise<Result<OrderDto, UpdateOrderFailure>> {
  const [invalidId, orderId] = parseId(orderIdInput);
  if (invalidId) return error(invalidId);

  const [invalid, form] = validateOrderForm(input);
  if (invalid) return error(invalid);

  const storedOrder = await findOrderExchangeRate(database, orderId);
  if (!storedOrder) return error({ reason: 'NotFound' });
  const stored = {
    endDate: storedOrder.endDate,
    currencyId: storedOrder.currencyId,
    currencyInfo: fromStoredExchangeRate(storedOrder.currency),
  };

  // Priced before the transaction, so it holds no connection while NBP is asked.
  const [unpriced, priced] = await priceOrder(database, form, nbp, now, stored);
  if (unpriced) return error(unpriced);
  const { loadingPlaces, unloadingPlaces, fields } = priced;

  try {
    const updated = await database.transaction(async (trx) => {
      const [updatedOrder] = await trx
        .update(order)
        .set(fields)
        .where(eq(order.id, orderId))
        .returning();
      if (!updatedOrder) return null;

      await deletePlaces(trx, orderId);
      await insertPlaces(trx, orderId, loadingPlaces, unloadingPlaces);
      await assignDriverToTruck(trx, updatedOrder);

      return updatedOrder;
    });
    if (!updated) return error({ reason: 'NotFound' });

    invalidate('update');

    return ok(selectOrderSchema.parse(updated));
  } catch (err) {
    if (isOrderNrTaken(err)) return error({ reason: 'OrderNrTaken' });
    throw err;
  }
}

/**
 * Sets an Order's Status, and nothing else, then invalidates the cached Orders.
 * Call it from a Server Action.
 */
export async function changeOrderStatus(
  database: db | dbTransaction,
  orderIdInput: unknown,
  statusIdInput: unknown,
): Promise<Result<OrderDto, ChangeOrderStatusFailure>> {
  const [invalidOrderId, orderId] = parseId(orderIdInput);
  if (invalidOrderId) return error(invalidOrderId);

  const [invalidStatusId, statusId] = parseId(statusIdInput);
  if (invalidStatusId) return error(invalidStatusId);

  try {
    // A savepoint, so a failed write leaves a caller's transaction usable.
    const [changed] = await database.transaction((trx) =>
      trx.update(order).set({ statusId }).where(eq(order.id, orderId)).returning(),
    );
    if (!changed) return error({ reason: 'NotFound' });

    invalidate('changeStatus');

    return ok(selectOrderSchema.parse(changed));
  } catch (err) {
    if (isUnknownStatus(err)) return error({ reason: 'UnknownStatus' });
    throw err;
  }
}

/**
 * Removes an Order with its Loading and Unloading Places, in one transaction, then invalidates
 * the cached Orders. Call it from a Server Action.
 */
export async function removeOrder(
  database: db | dbTransaction,
  orderIdInput: unknown,
): Promise<Result<OrderDto, RemoveOrderFailure>> {
  const [invalidId, orderId] = parseId(orderIdInput);
  if (invalidId) return error(invalidId);

  const removed = await database.transaction(async (trx) => {
    await deletePlaces(trx, orderId);
    const [removedOrder] = await trx.delete(order).where(eq(order.id, orderId)).returning();

    return removedOrder;
  });
  if (!removed) return error({ reason: 'NotFound' });

  invalidate('remove');

  return ok(selectOrderSchema.parse(removed));
}

function invalidate(write: keyof typeof INVALIDATED_TAGS) {
  for (const tag of INVALIDATED_TAGS[write]) updateTag(tag);
}

/** Parses a row id, such as an Order's or a Status's, from a Server Action's untrusted input. */
function parseId(input: unknown) {
  const validation = z.int().positive().safeParse(input);
  if (!validation.success) return invalidData(z.prettifyError(validation.error));

  return ok(validation.data);
}

/** Validates the Order form from a Server Action's untrusted input. */
function validateOrderForm(input: unknown) {
  const validation = OrderFormSchema.safeParse(input);
  if (!validation.success) return invalidData(z.prettifyError(validation.error));

  return ok(validation.data);
}

/**
 * Turns the Order form's price into the Order's PLN price, at `stored`'s Exchange Rate while the
 * form keeps its Unloading Date and Currency, otherwise at the one `nbp` gives as of the company's
 * day at `now`.
 */
async function priceOrder(
  database: db | dbTransaction,
  form: OrderFormDto,
  nbp: Nbp,
  now: Date | undefined,
  stored?: StoredExchangeRate,
) {
  const { loadingPlaces, unloadingPlaces, ...fields } = form;

  const orderCurrency = await findCurrency(database, fields.currencyId);
  if (!orderCurrency) return invalidData('Nieznana waluta.');

  const source = stored && exchangeRateSource(stored, fields.endDate, fields.currencyId);
  const [noExchangeRate, currencyInfo] =
    source?.kind === 'stored'
      ? ok(source.currencyInfo)
      : await findExchangeRate(nbp, orderCurrency, fields.endDate, getToday(now));
  if (noExchangeRate) return error(noExchangeRate);

  const price = toStoredPrice(fields.currencyId, fields.priceCurrency, currencyInfo);
  if (!price) return invalidData('Brak kursu waluty.');

  return ok({ loadingPlaces, unloadingPlaces, fields: { ...fields, ...price } });
}

/**
 * Stores the Places in the order the user entered them in. One transaction is one client, so the
 * inserts run one after another.
 */
async function insertPlaces(
  trx: dbTransaction,
  orderId: number,
  loadingPlaces: CityDto[],
  unloadingPlaces: CityDto[],
) {
  const inEnteredOrder = (places: CityDto[]) =>
    places.map((city, position) => ({ orderId, placeId: city.id, position }));

  await trx.insert(loadingPlace).values(inEnteredOrder(loadingPlaces));
  await trx.insert(unloadingPlace).values(inEnteredOrder(unloadingPlaces));
}

async function deletePlaces(trx: dbTransaction, orderId: number) {
  await trx.delete(loadingPlace).where(eq(loadingPlace.orderId, orderId));
  await trx.delete(unloadingPlace).where(eq(unloadingPlace.orderId, orderId));
}

async function assignDriverToTruck(
  trx: dbTransaction,
  { driverId, truckId }: { driverId: number; truckId: number },
) {
  await trx.update(truck).set({ driverId }).where(eq(truck.id, truckId));
}

function isOrderNrTaken(err: unknown) {
  return isUniqueViolation(err, 'orders_customer_id_order_nr_unique');
}

function isUnknownStatus(err: unknown) {
  return isForeignKeyViolation(err, 'orders_status_id_statuses_id_fk');
}
