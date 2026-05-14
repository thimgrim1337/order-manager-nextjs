-- Custom SQL migration file, put your code below! ---- Custom SQL migration file, put your code below! ---- Custom SQL migration file, put your code below! --
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
  o.currency_rate,
  o.truck_id,
  o.driver_id,
  o.customer_id,

  -- Flat columns (dla sortowania/filtrowania)
  c.name as customer_name,
  CONCAT(d.first_name, ' ', d.last_name) as driver_fullname,
  t.plate as truck_plate,
  s.name as status_name,
  cs.code as currency_code,

  -- JSON objects (bezpośrednio z JOINów)
  JSON_BUILD_OBJECT('id', c.id, 'name', c.name, 'tax', c.tax) as customer,
  JSON_BUILD_OBJECT('id', d.id, 'firstName', d.first_name, 'lastName', d.last_name) as driver,
  JSON_BUILD_OBJECT('id', t.id, 'plate', t.plate, 'insuranceEndAt', t.insurance_end_at, 'serviceEndAt', t.service_end_at, 'driverId', t.driver_id) as truck,
  JSON_BUILD_OBJECT('id', s.id, 'name', s.name) as status,

  -- Loading/unloading places (subquery potrzebne bo relacja 1:N)
  (
    SELECT COALESCE(
      JSON_AGG(JSON_BUILD_OBJECT('id', lc.id, 'name', lc.name, 'postal', lc.postal, 'countryId', lc.country_id)),
      '[]'::json
    )
    FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    WHERE lp.order_id = o.id
  ) as loading_places,
  (
    SELECT COALESCE(
      JSON_AGG(JSON_BUILD_OBJECT('id', uc.id, 'name', uc.name, 'postal', uc.postal, 'countryId', uc.country_id)),
      '[]'::json
    )
    FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    WHERE up.order_id = o.id
  ) as unloading_places,

  -- Sorting helpers
  (
    SELECT lc.name FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    WHERE lp.order_id = o.id ORDER BY lc.id LIMIT 1
  ) as loading_city,
  (
    SELECT uc.name FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    WHERE up.order_id = o.id ORDER BY uc.id DESC LIMIT 1
  ) as unloading_city

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN drivers d ON o.driver_id = d.id
LEFT JOIN trucks t ON o.truck_id = t.id
LEFT JOIN statuses s ON o.status_id = s.id
LEFT JOIN currencies cs ON o.currency_id = cs.id;