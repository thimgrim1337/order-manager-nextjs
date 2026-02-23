import { customer } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';
import { ZOD_ERROR_MESSAGES } from '../consts';

export const createCustomerSchema = createInsertSchema(customer, {
  name: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(1, { error: ZOD_ERROR_MESSAGES.FieldRequired })
    .max(100),
  tax: z
    .string({ error: ZOD_ERROR_MESSAGES.FieldRequired })
    .min(12, { error: 'NIP powinien mieć conajmniej 12 znaków.' })
    .max(20),
});
export const selectCustomerSchema = createSelectSchema(customer);

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type CustomerDto = z.infer<typeof selectCustomerSchema>;
