CREATE TABLE "cities" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "cities_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"postal" text NOT NULL,
	"country_id" integer NOT NULL,
	CONSTRAINT "cities_name_postal_country_id_unique" UNIQUE("name","postal","country_id")
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "countries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "countries_name_unique" UNIQUE("name"),
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "customers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"tax_nr" text NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "customers_tax_nr_unique" UNIQUE("tax_nr"),
	CONSTRAINT "customers_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "drivers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" text NOT NULL,
	"last_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_loading_places" (
	"order_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	CONSTRAINT "order_loading_places_order_id_place_id_pk" PRIMARY KEY("order_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "orders_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"order_nr" text NOT NULL,
	"start_date" date DEFAULT now() NOT NULL,
	"end_date" date DEFAULT now() NOT NULL,
	"status_id" integer DEFAULT 1 NOT NULL,
	"price_currency" numeric(10, 2) NOT NULL,
	"price_pln" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'PLN' NOT NULL,
	"currency_rate" numeric(5, 4) DEFAULT '1' NOT NULL,
	"truck_id" integer NOT NULL,
	"driver_id" integer NOT NULL,
	"customer_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statuses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "statuses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	CONSTRAINT "statuses_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "trucks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "trucks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"plate" text NOT NULL,
	"insurance_endAt" date NOT NULL,
	"service_endAt" date NOT NULL,
	"driver_id" integer,
	CONSTRAINT "trucks_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "order_unloading_places" (
	"order_id" integer NOT NULL,
	"place_id" integer NOT NULL,
	CONSTRAINT "order_unloading_places_order_id_place_id_pk" PRIMARY KEY("order_id","place_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" text NOT NULL,
	"password" text NOT NULL,
	"token" text,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_loading_places" ADD CONSTRAINT "order_loading_places_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_loading_places" ADD CONSTRAINT "order_loading_places_place_id_cities_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_status_id_statuses_id_fk" FOREIGN KEY ("status_id") REFERENCES "public"."statuses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_truck_id_trucks_id_fk" FOREIGN KEY ("truck_id") REFERENCES "public"."trucks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trucks" ADD CONSTRAINT "trucks_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_unloading_places" ADD CONSTRAINT "order_unloading_places_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_unloading_places" ADD CONSTRAINT "order_unloading_places_place_id_cities_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_cities_name_lower" ON "cities" USING btree (LOWER("name"));--> statement-breakpoint
CREATE INDEX "idx_customers_name_lower" ON "customers" USING btree (LOWER("name"));--> statement-breakpoint
CREATE INDEX "idx_loading_places_order_id" ON "order_loading_places" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_order_nr_lower" ON "orders" USING btree (LOWER("order_nr"));--> statement-breakpoint
CREATE INDEX "idex_orders_start_date_date" ON "orders" USING btree (DATE("start_date"));--> statement-breakpoint
CREATE INDEX "idex_orders_end_date_date" ON "orders" USING btree (DATE("end_date"));--> statement-breakpoint
CREATE INDEX "idx_statuses_name_lower" ON "statuses" USING btree (LOWER("name"));--> statement-breakpoint
CREATE INDEX "idx_trucks_plate_lower" ON "trucks" USING btree (LOWER("plate"));--> statement-breakpoint
CREATE INDEX "idx_unloading_places_order_id" ON "order_unloading_places" USING btree ("order_id");