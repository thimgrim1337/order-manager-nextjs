import { drizzle } from "drizzle-orm/node-postgres";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js/driver";
import { ENV } from "@/env";
import * as schema from "./schemas/index";

// You can specify any property from the node-postgres connection options
export const db = drizzle({
	connection: {
		connectionString: ENV.DB_URL!,
	},
	schema,
	logger: true,
});

export type db = typeof db;
export type dbTransaction = PostgresJsDatabase<typeof schema>;
export default db;
