import db from '@/db/db';
import { getCitiesIds } from '@/lib/dal/cityDAL';
import {
  getOrderByNumberAndCustomer,
  createOrder,
  addOrderPlaces,
} from '@/lib/dal/ordersDAL';
import { updateTruckAssignedDriver } from '@/lib/dal/truckDAL';
import { AppError } from '@/lib/error';
import { FormOrderCreate } from '@/types/types';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = (await request.json()) as FormOrderCreate;
    const {
      orderNr,
      customerId,
      loadingPlaces,
      unloadingPlaces,
      currency,
      priceCurrency,
      currencyInfo,
      truckId,
      driverId,
    } = requestBody;
    let pricePLN: string;
    let currencyRate: string = '1';

    const existingOrder = await getOrderByNumberAndCustomer(
      orderNr,
      customerId
    );

    if (existingOrder) throw new AppError('Order already exist.', 409);

    const loadingCitiesIds = await getCitiesIds(loadingPlaces);
    const unloadingPlacesIds = await getCitiesIds(unloadingPlaces);

    if (!loadingCitiesIds.length || !unloadingPlacesIds.length)
      throw new AppError('Invalid places provided.', 400);

    if (currency === 'EUR' && currencyInfo.rate) {
      currencyRate = currencyInfo.rate;
      pricePLN = String(+priceCurrency * +currencyRate);
    } else {
      pricePLN = priceCurrency;
    }

    const newOrder = {
      ...requestBody,
      pricePLN,
      currencyRate,
    };

    const createdOrder = await db.transaction(async (trx) => {
      const order = await createOrder(newOrder, trx);

      await addOrderPlaces(order.id, loadingCitiesIds, 'loadingPlace', trx);
      await addOrderPlaces(order.id, unloadingPlacesIds, 'unloadingPlace', trx);
      await updateTruckAssignedDriver(truckId, driverId, trx);

      return order;
    });

    revalidatePath('/orders');

    return NextResponse.json({ success: true, createdOrder }, { status: 200 });
  } catch (e) {
    const { message, statusCode } =
      e instanceof AppError
        ? e
        : { message: 'Unexpected error.', statusCode: 500 };

    return NextResponse.json(message, { status: statusCode });
  }
}
