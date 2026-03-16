import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { country } from "@/db/schemas";

export const createCountrySchema = createInsertSchema(country);
export const selectCountrySchema = createSelectSchema(country);

export type CreateCountryDto = z.infer<typeof createCountrySchema>;
export type CountryDto = z.infer<typeof selectCountrySchema>;
