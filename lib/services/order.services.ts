import db from '@/db/db';
import z from 'zod';
import { createOrderFormSchema, selectOrderSchema } from '../dto/order.dto';
import { error, ok } from '../error';
import {
  addOrderPlaces,
  checkIfOrderExist,
  createOrder,
} from '../dal/order.dal';
import { updateTruckAssignedDriver } from '../dal/truck.dal';

export async function createOrderService(rawData: unknown) {
  const validationResult = createOrderFormSchema.safeParse(rawData);
  if (!validationResult.success)
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validationResult.error),
    });

  const validatedData = validationResult.data;

  const { loadingPlaces, unloadingPlaces, currencyInfo, ...order } =
    validatedData;

  const isOrderExist = await checkIfOrderExist(order.orderNr, order.customerId);

  if (isOrderExist)
    return error({
      reason: 'OrderExist',
    });

  let pricePLN: string;
  let currencyRate: string = '1';

  if (order.currency === 'EUR' && currencyInfo.rate) {
    currencyRate = currencyInfo.rate;
    pricePLN = String(+order.priceCurrency * +currencyRate);
  } else {
    pricePLN = order.priceCurrency;
  }

  const newOrder = {
    ...order,
    pricePLN,
    currencyRate,
  };

  try {
    const dbOrder = await db.transaction(async (trx) => {
      const order = await createOrder(newOrder, trx);

      await addOrderPlaces(order.id, loadingPlaces, 'loadingPlace', trx);
      await addOrderPlaces(order.id, unloadingPlaces, 'unloadingPlace', trx);
      await updateTruckAssignedDriver(order.truckId, order.driverId, trx);

      return order;
    });

    return ok(selectOrderSchema.parse(dbOrder));
  } catch (err) {
    return error({
      reason: `UnexpectedError`,
      details: err,
    });
  }
}
