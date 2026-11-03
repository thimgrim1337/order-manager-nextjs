'use server';

import db from '@/db/db';
import { type ActionResponse, toActionResponse } from './action-response';
import { getCities } from './dal/city.dal';
import { getCustomers } from './dal/customer.dal';
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
  return getCustomers(query);
}

export async function searchCities(query: string) {
  return getCities(query);
}

export async function createCustomer(
  formData: CreateCustomerDto,
): Promise<ActionResponse<CustomerDto>> {
  return toActionResponse(await createCustomerService(db, formData));
}

export async function createCity(formData: CreateCityDto): Promise<ActionResponse<CityDto>> {
  return toActionResponse(await createCityService(db, formData));
}
