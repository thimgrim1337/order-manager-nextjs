import { relations, sql } from 'drizzle-orm';
import { integer, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';

import country from './country';
import loadingPlace from './loadingPlace';
import unloadingPlace from './unloadingPlace';

const city = pgTable(
  'cities',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: text().notNull(),
    postal: text().notNull(),
    countryId: integer('country_id')
      .notNull()
      .references(() => country.id),
  },
  // A name is taken regardless of letter case.
  (table) => [uniqueIndex('cities_name_unique').using('btree', sql`LOWER(${table.name})`)],
);

export const cityRelations = relations(city, ({ one, many }) => ({
  loadingPlaces: many(loadingPlace),
  unloadingPlaces: many(unloadingPlace),
  country: one(country, {
    fields: [city.countryId],
    references: [country.id],
  }),
}));

export default city;
