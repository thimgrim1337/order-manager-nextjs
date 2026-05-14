import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

const currencies = pgTable("currencies", {
	id: integer().primaryKey().generatedAlwaysAsIdentity(),
	code: varchar({ length: 3 }).notNull().unique(),
});

export default currencies;
