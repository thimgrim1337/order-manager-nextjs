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
  Status: 'status',
  Countries: 'countries',
  Customers: 'customers',
  Cities: 'cities',
} as const;

export const DEFAULT_PAGE_INDEX = 0;
export const DEFAULT_PAGE_SIZE = 10;

type ZodMessages = {
  FieldRequired: 'Pole jest wymagane.';
};

export const ZOD_ERROR_MESSAGES: ZodMessages = {
  FieldRequired: 'Pole jest wymagane.',
};

export const ORDER_SORT_FIELDS = [
  'orderNr',
  'startDate',
  'endDate',
  'loadingCity',
  'unloadingCity',
  'statusId',
  'truckPlate',
  'driverFullname',
  'customerName',
  'priceCurrency',
  'currencyId',
  'pricePLN',
] as const;

export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];
