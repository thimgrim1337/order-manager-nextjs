'use server';

import { revalidateTag } from 'next/cache';
import db from '@/db/db';
import { type ActionResponse, toActionResponse } from './action-response';
import { CACHE_TAG } from './consts';
import { getAllCustomers } from './dal/customer.dal.';
import type { CityDto, CreateCityDto } from './dto/city.dto';
import type { CreateCustomerDto, CustomerDto } from './dto/customer.dto';
import type { OrderDto, OrderFormDto } from './dto/order.dto';
import * as Orders from './orders';
import { createCityService } from './services/city.services';
import { createCustomerService } from './services/customer.services';

export async function createOrder(formData: OrderFormDto): Promise<ActionResponse<OrderDto>> {
  return toActionResponse(await Orders.createOrder(db, formData));
}

export async function updateOrder(
  orderId: number,
  formData: OrderFormDto,
): Promise<ActionResponse<OrderDto>> {
  return toActionResponse(await Orders.updateOrder(db, orderId, formData));
}

export async function changeOrderStatus(
  orderId: number,
  statusId: number,
): Promise<ActionResponse<OrderDto>> {
  return toActionResponse(await Orders.changeOrderStatus(db, orderId, statusId));
}

export async function removeOrder(orderId: number): Promise<ActionResponse<OrderDto>> {
  return toActionResponse(await Orders.removeOrder(db, orderId));
}

export async function searchCustomers(query: string) {
  return getAllCustomers(query);
}

export async function createCustomer(
  formData: CreateCustomerDto,
): Promise<ActionResponse<CustomerDto>> {
  const outcome = await createCustomerService(db, formData);
  if (outcome[0] === null) revalidateTag(CACHE_TAG.Orders, 'max');

  return toActionResponse(outcome);
}

export async function createCity(formData: CreateCityDto): Promise<ActionResponse<CityDto>> {
  const outcome = await createCityService(db, formData);
  if (outcome[0] === null) revalidateTag(CACHE_TAG.Orders, 'max');

  return toActionResponse(outcome);
}
