import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type z from 'zod';
import { customer } from '@/db/schemas';
import { nameSchema } from '../name';
import { taxNumberSchema } from '../tax-number';

export const createCustomerSchema = createInsertSchema(customer, {
  name: nameSchema(100),
  tax: taxNumberSchema,
});
export const selectCustomerSchema = createSelectSchema(customer);

export type CreateCustomerDto = z.input<typeof createCustomerSchema>;
