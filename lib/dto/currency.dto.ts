import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { currency } from "@/db/schemas";

export const selectCurrencySchema = createSelectSchema(currency);

export type CurrencyDto = z.infer<typeof selectCurrencySchema>;
