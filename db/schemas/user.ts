import { pgTable, integer, text } from 'drizzle-orm/pg-core';

const user = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  username: text().notNull().unique(),
  password: text().notNull(),
  token: text().unique(),
});

export default user;
