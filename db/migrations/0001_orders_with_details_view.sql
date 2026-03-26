-- Custom SQL migration file, put your code below! --
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
  o.currency,
  o.currency_rate,
  o.truck_id,
  o.driver_id,
  o.customer_id,
  
  -- Joined data
  c.name as customer_name,
  CONCAT(d.first_name, ' ', d.last_name) as driver_name,
  t.plate as truck_plate,
  s.name as status_name,
  
  -- Loading places as JSON
  (
    SELECT COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', lc.id,
          'name', lc.name,
          'postal', lc.postal,
          'countryID', lc.country_id
        ) 
      ), 
      '[]'::json
    )
    FROM order_loading_places lp 
    JOIN cities lc ON lp.place_id = lc.id 
    WHERE lp.order_id = o.id
  ) as loading_places,
  
  -- Unloading places as JSON
  (
    SELECT COALESCE(
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id', uc.id,
          'name', uc.name,
          'postal', uc.postal,
          'countryID', uc.country_id
        ) 
      ), 
      '[]'::json
    )
    FROM order_unloading_places up 
    JOIN cities uc ON up.place_id = uc.id 
    WHERE up.order_id = o.id
  ) as unloading_places,
  
  -- First loading city for sorting
  (
    SELECT lc.name
    FROM order_loading_places lp
    JOIN cities lc ON lp.place_id = lc.id
    WHERE lp.order_id = o.id
    ORDER BY lc.id
    LIMIT 1
  ) as loading_city,
  
  -- Last unloading city for sorting
  (
    SELECT uc.name
    FROM order_unloading_places up
    JOIN cities uc ON up.place_id = uc.id
    WHERE up.order_id = o.id
    ORDER BY uc.id DESC
    LIMIT 1
  ) as unloading_city

FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
LEFT JOIN drivers d ON o.driver_id = d.id
LEFT JOIN trucks t ON o.truck_id = t.id
LEFT JOIN statuses s ON o.status_id = s.id;