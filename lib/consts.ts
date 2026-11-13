/** Order Status ids, as seeded by `db/seeds/reference.ts`. */
export const ORDER_STATUS = {
  InProgress: 1,
  Cancelled: 2,
  Delivered: 3,
} as const;

/** Currency ids, as seeded by `db/seeds/reference.ts`. */
export const CURRENCY = {
  PLN: 1,
  EUR: 2,
} as const;

/** Cache tags: the DAL tags what it caches with them, and writes invalidate them. */
export const CACHE_TAG = {
  Orders: 'orders',
  Trucks: 'trucks',
  Drivers: 'drivers',
  Countries: 'countries',
  Customers: 'customers',
  Cities: 'cities',
  Currencies: 'currencies',
} as const;

export const DEFAULT_PAGE_INDEX = 0;
/** The page sizes the Orders Table offers; a URL asking for any other gets the default. */
export const PAGE_SIZES = [10, 20, 30, 40, 50] as const;
export const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

/** How many Customers or Cities a search returns: the comboboxes show the first ones by name. */
export const SEARCH_LIMIT = 10;

type ZodMessages = {
  FieldRequired: 'Pole jest wymagane.';
};

export const ZOD_ERROR_MESSAGES: ZodMessages = {
  FieldRequired: 'Pole jest wymagane.',
};
