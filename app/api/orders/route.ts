import db from '@/db/db';
import {
  getOrderByNumberAndCustomer,
  createOrder,
  addOrderPlaces,
} from '@/lib/dal/ordersDAL';
import { AppError } from '@/lib/error';
import { getCitiesIds } from '@/lib/utils';
import { OrderCreate as TOrderCreate } from '@/types/types';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const requestBody = (await request.json()) as TOrderCreate;
    const { orderNr, customerId, loadingPlaces, unloadingPlaces } = requestBody;

    const existingOrder = await getOrderByNumberAndCustomer(
      orderNr,
      customerId
    );

    if (existingOrder) throw new AppError('Order already exist.', 409);

    const loadingCitiesIds = await getCitiesIds(loadingPlaces);
    const unloadingPlacesIds = await getCitiesIds(unloadingPlaces);

    if (!loadingCitiesIds.length || !unloadingPlacesIds.length)
      throw new AppError('Invalid places provided.', 400);

    const createdOrder = await db.transaction(async (trx) => {
      const order = await createOrder(requestBody, trx);

      await addOrderPlaces(order.id, loadingCitiesIds, 'loadingPlace', trx);
      await addOrderPlaces(order.id, unloadingPlacesIds, 'unloadingPlace', trx);

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
