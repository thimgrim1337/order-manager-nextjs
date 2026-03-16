import { sql } from "drizzle-orm";
import { index, integer, pgTable, text } from "drizzle-orm/pg-core";

const status = pgTable(
	"statuses",
	{
		id: integer().primaryKey().generatedAlwaysAsIdentity(),
		name: text().unique().notNull(),
	},
	(table) => [
		index("idx_statuses_name_lower").using("btree", sql`LOWER(${table.name})`),
	],
);

export default status;
