-- Each Loading and Unloading Place carries its City's Country, so the Order read model needs no
-- separate list of Countries.
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
  d.first_name COLLATE "pl-PL-x-icu" as driver_first_name,
  d.last_name COLLATE "pl-PL-x-icu" as driver_last_name,
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
      JSON_AGG(JSON_BUILD_OBJECT(
        'id', lc.id, 'name', lc.name, 'postal', lc.postal, 'countryId', lc.country_id,
        'country', JSON_BUILD_OBJECT('id', lco.id, 'name', lco.name, 'code', lco.code)
      ) ORDER BY lp.position),
      '[]'::json
    )
    FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    JOIN countries lco ON lc.country_id = lco.id
    WHERE lp.order_id = o.id
  ) as loading_places,
  (
    SELECT COALESCE(
      JSON_AGG(JSON_BUILD_OBJECT(
        'id', uc.id, 'name', uc.name, 'postal', uc.postal, 'countryId', uc.country_id,
        'country', JSON_BUILD_OBJECT('id', uco.id, 'name', uco.name, 'code', uco.code)
      ) ORDER BY up.position),
      '[]'::json
    )
    FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    JOIN countries uco ON uc.country_id = uco.id
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
