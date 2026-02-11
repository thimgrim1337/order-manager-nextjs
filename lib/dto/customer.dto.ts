import { customer } from '@/db/schemas';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

export const createCustomerSchema = createInsertSchema(customer, {
  name: z
    .string({ error: 'Pole jest wymagane.' })
    .min(1, { error: 'Pole jest wymagane.' })
    .max(100),
  tax: z
    .string({ error: 'Pole jest wymagane.' })
    .min(12, { error: 'NIP powinien mieć conajmniej 12 znaków.' })
    .max(20),
});
export const selectCustomerSchema = createSelectSchema(customer);

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type CustomerDto = z.infer<typeof selectCustomerSchema>;
