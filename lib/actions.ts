'use server';

import z from 'zod';
import { CreateOrderFormDto, createOrderFormSchema } from './dto/order.dto';
import { error, ok } from './error';
import { createOrderService } from './services/order.services';
import { revalidatePath } from 'next/cache';
import { CreateCustomerDto } from './dto/customer.dto';
import { createCustomerService } from './services/customer.services';

export async function validateServer(formData: unknown) {
  const validatedData = createOrderFormSchema.safeParse(formData);

  if (!validatedData.success) {
    return error({
      reason: 'InvalidData',
      details: z.prettifyError(validatedData.error),
    });
  }

  return ok(validatedData.data);
}

export async function createOrder(formData: CreateOrderFormDto) {
  const [error, order] = await createOrderService(formData);

  if (error === null) {
    revalidatePath('/orders');
    return {
      success: true,
      data: order,
    };
  }

  const reason = error.reason;
  switch (reason) {
    case 'InvalidData': {
      return {
        message: 'Nieprawidłowe dane.',
        details: error.details,
      };
    }
    case 'OrderExist': {
      return {
        message: 'Zlecenie o tym numerze już istnieje.',
      };
    }
    case 'UnexpectedError': {
      return {
        message: 'Wystąpił nieznany błąd.',
        details: error.details,
      };
    }
    default: {
      throw new Error(`Unhandled error: ${reason satisfies never}`);
    }
  }
}

export async function createCustomer(formData: CreateCustomerDto) {
  const [error, customer] = await createCustomerService(formData);

  if (error === null) {
    revalidatePath('/orders');
    return {
      success: true,
      data: customer,
    };
  }

  const reason = error.reason;
  switch (reason) {
    case 'InvalidData': {
      return {
        message: 'Nieprawidłowe dane.',
        details: error.details,
      };
    }
    case 'CustomerExist': {
      return {
        message: 'Ten zleceniodawca już istnieje.',
      };
    }
    case 'UnexpectedError': {
      return {
        message: 'Wystąpił nieznany błąd.',
        details: error.details,
      };
    }
    default: {
      throw new Error(`Unhandled error: ${reason satisfies never}`);
    }
  }
}
