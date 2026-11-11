-- The view only filters, sorts and counts Orders: the Order DAL loads the Orders themselves, with
-- their Customer, Driver, Truck, Status, Currency and Places, through the schema's relations.
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

  -- Sorting and Search helpers
  c.name COLLATE "pl-PL-x-icu" as customer_name,
  d.first_name COLLATE "pl-PL-x-icu" as driver_first_name,
  d.last_name COLLATE "pl-PL-x-icu" as driver_last_name,
  t.plate as truck_plate,
  s.name as status_name,
  cs.code as currency_code,

  -- The first Loading Place and last Unloading Place, as displayed
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
