import { relations } from 'drizzle-orm';
import { pgTable, integer, text } from 'drizzle-orm/pg-core';

import city from './city';

const country = pgTable('countries', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  code: text().notNull().unique(),
});

export const countryRelations = relations(country, ({ many }) => ({
  cities: many(city),
}));

export default country;
