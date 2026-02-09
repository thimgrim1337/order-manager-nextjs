import { customer } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const createCustomerSchema = createInsertSchema(customer);
export const selectCustomerSchema = createSelectSchema(customer);

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type CustomerDto = z.infer<typeof selectCustomerSchema>;
