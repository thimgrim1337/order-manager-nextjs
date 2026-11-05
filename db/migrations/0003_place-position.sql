-- Places keep the order the user entered them in. Existing Places get their City-id order, which is
-- what the sort and Search helpers already used: the lowest id first, the highest last.
ALTER TABLE "order_loading_places" ADD COLUMN "position" integer;--> statement-breakpoint
ALTER TABLE "order_unloading_places" ADD COLUMN "position" integer;--> statement-breakpoint
UPDATE "order_loading_places" lp SET "position" = ranked.position
FROM (
  SELECT order_id, place_id, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY place_id) - 1 AS position
  FROM "order_loading_places"
) ranked
WHERE lp.order_id = ranked.order_id AND lp.place_id = ranked.place_id;--> statement-breakpoint
UPDATE "order_unloading_places" up SET "position" = ranked.position
FROM (
  SELECT order_id, place_id, ROW_NUMBER() OVER (PARTITION BY order_id ORDER BY place_id) - 1 AS position
  FROM "order_unloading_places"
) ranked
WHERE up.order_id = ranked.order_id AND up.place_id = ranked.place_id;--> statement-breakpoint
ALTER TABLE "order_loading_places" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_unloading_places" ALTER COLUMN "position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "order_loading_places" ADD CONSTRAINT "order_loading_places_order_id_position_unique" UNIQUE("order_id","position");--> statement-breakpoint
ALTER TABLE "order_unloading_places" ADD CONSTRAINT "order_unloading_places_order_id_position_unique" UNIQUE("order_id","position");--> statement-breakpoint
-- The view orders the aggregated Places, and picks the sort/Search City, by position.
DROP VIEW orders_with_details;--> statement-breakpoint
CREATE VIEW orders_with_details AS
SELECT 
  o.id,
  o.created_at,
  o.updated_at,
  o.order_nr,
  o.start_date,
  o.end_date,
  o.status_id,
  o.price_currency,
  o.price_pln,
  o.currency_id,
  o.exchange_rate,
  o.exchange_date,
  o.truck_id,
  o.driver_id,
  o.customer_id,

  -- Flat columns (dla sortowania/filtrowania)
  c.name COLLATE "pl-PL-x-icu" as customer_name,
  CONCAT(d.first_name, ' ', d.last_name) COLLATE "pl-PL-x-icu" as driver_fullname,
  t.plate as truck_plate,
  s.name as status_name,
  cs.code as currency_code,

  -- JSON objects (bezpośrednio z JOINów)
  JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'tax', c.tax) as customer,
  JSON_BUILD_OBJECT('id', d.id, 'firstName', d.first_name, 'lastName', d.last_name) as driver,
  JSON_BUILD_OBJECT('id', t.id, 'plate', t.plate, 'insuranceEndAt', t.insurance_end_at, 'serviceEndAt', t.service_end_at, 'driverId', t.driver_id) as truck,
  JSON_BUILD_OBJECT('id', s.id, 'name', s.name) as status,
  JSON_BUILD_OBJECT('id', o.currency_id, 'code', cs.code, 'rate', o.exchange_rate, 'date', o.exchange_date) as currency_info,

  -- Loading/unloading places (subquery potrzebne bo relacja 1:N)
  (
    SELECT COALESCE(
      JSON_AGG(JSON_BUILD_OBJECT('id', lc.id, 'name', lc.name, 'postal', lc.postal, 'countryId', lc.country_id) ORDER BY lp.position),
      '[]'::json
    )
    FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    WHERE lp.order_id = o.id
  ) as loading_places,
  (
    SELECT COALESCE(
      JSON_AGG(JSON_BUILD_OBJECT('id', uc.id, 'name', uc.name, 'postal', uc.postal, 'countryId', uc.country_id) ORDER BY up.position),
      '[]'::json
    )
    FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    WHERE up.order_id = o.id
  ) as unloading_places,

  -- Sorting and Search helpers: the first Loading Place and last Unloading Place, as displayed
  (
    SELECT lc.name COLLATE "pl-PL-x-icu" FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    WHERE lp.order_id = o.id ORDER BY lp.position LIMIT 1
  ) as loading_city,
  (
    SELECT uc.name COLLATE "pl-PL-x-icu" FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    WHERE up.order_id = o.id ORDER BY up.position DESC LIMIT 1
  ) as unloading_city

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN drivers d ON o.driver_id = d.id
LEFT JOIN trucks t ON o.truck_id = t.id
LEFT JOIN statuses s ON o.status_id = s.id
LEFT JOIN currencies cs ON o.currency_id = cs.id;
