import { createSelectSchema } from "drizzle-zod";
import z from "zod";
import { status } from "@/db/schemas";

export const selectStatusSchema = createSelectSchema(status);
export type StatusDto = z.infer<typeof selectStatusSchema>;
