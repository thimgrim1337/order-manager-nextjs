ALTER TABLE "cities" DROP CONSTRAINT "cities_name_unique";--> statement-breakpoint
ALTER TABLE "cities" DROP CONSTRAINT "cities_name_postal_country_id_unique";--> statement-breakpoint
ALTER TABLE "customers" DROP CONSTRAINT "customers_name_unique";--> statement-breakpoint
DROP INDEX "idx_cities_name_lower";--> statement-breakpoint
DROP INDEX "idx_customers_name_lower";--> statement-breakpoint
-- Write existing names and Tax Numbers as createCitySchema / createCustomerSchema now do, so the
-- unique indexes below and customers_tax_unique compare them alike. Rows that then collide fail it.
-- The class spells out JavaScript's \s (lib/name.ts, lib/tax-number.ts): Postgres' \s leaves out
-- the no-break and other Unicode spaces.
UPDATE "cities" SET "name" = btrim(regexp_replace("name", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff]+', ' ', 'g'));--> statement-breakpoint
UPDATE "customers" SET "name" = btrim(regexp_replace("name", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff]+', ' ', 'g'));--> statement-breakpoint
UPDATE "customers" SET "tax" = regexp_replace(upper(regexp_replace("tax", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff.-]', '', 'g')), '^PL(\d{10})$', '\1');--> statement-breakpoint
CREATE UNIQUE INDEX "cities_name_unique" ON "cities" USING btree (LOWER("name"));--> statement-breakpoint
CREATE UNIQUE INDEX "customers_name_unique" ON "customers" USING btree (LOWER("name"));
