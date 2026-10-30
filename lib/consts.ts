/** Order Status ids, as seeded in the statuses table (`db/seeds/data/status.json`). */
export const ORDER_STATUS = {
  InProgress: 1,
  Cancelled: 2,
  Delivered: 3,
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
  'truckId',
  'driverId',
  'customerId',
  'priceCurrency',
  'currencyId',
  'pricePLN',
] as const;

export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];
