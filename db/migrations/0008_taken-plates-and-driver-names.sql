ALTER TABLE "drivers" DROP CONSTRAINT "drivers_first_name_last_name_unique";--> statement-breakpoint
DROP INDEX "idx_trucks_plate_lower";--> statement-breakpoint
-- Write existing Plates and Driver names in the form the Glossary gives them, so the unique index
-- and constraint below compare them alike. Rows that then collide fail them. The class spells out
-- JavaScript's \s as 0007 does: Postgres' \s leaves out the no-break and other Unicode spaces.
UPDATE "trucks" SET "plate" = upper(regexp_replace("plate", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff-]', '', 'g'));--> statement-breakpoint
UPDATE "drivers" SET "first_name" = btrim(regexp_replace("first_name", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff]+', ' ', 'g')), "last_name" = btrim(regexp_replace("last_name", '[\s\x00a0\x1680\x2000-\x200a\x2028\x2029\x202f\x205f\x3000\xfeff]+', ' ', 'g'));--> statement-breakpoint
CREATE UNIQUE INDEX "drivers_name_unique" ON "drivers" USING btree (LOWER("first_name"),LOWER("last_name"));--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_plate_canonical" CHECK ("trucks"."plate" ~ '^[A-Z0-9]+$');
