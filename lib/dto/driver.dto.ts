import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { driver } from "@/db/schemas";

export const createDriverSchema = createInsertSchema(driver);
export const selectDriverSchema = createSelectSchema(driver);

export type CreateDriverDto = z.infer<typeof createDriverSchema>;
export type DriverDto = z.infer<typeof selectDriverSchema>;
