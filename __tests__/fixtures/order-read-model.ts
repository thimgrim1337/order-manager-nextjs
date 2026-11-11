import type { OrderReadModel } from '@/lib/dal/order.dal';
import { toPricePLN } from '@/lib/exchange-rate';
import { orderChoices } from '../utils/order-choices';

/** The fields a browser test may override; the Order's foreign keys follow from its relations. */
type OrderReadModelFields = Partial<
  Omit<OrderReadModel, 'statusId' | 'customerId' | 'driverId' | 'truckId' | 'currencyId'>
>;

/**
 * An Order read model for a browser test: ZL/1, PLN 1000, in progress, 2026-10-27 → 2026-10-29,
 * Płock → Płock, with DEVIL, Jan and WND0997C from `orderChoices`. A PLN Order has no Exchange
 * Rate date; a foreign-Currency one is a `currency`, `exchangeRate` and `exchangeDate` override
 * away. Unless overridden, the PLN Price is the Price at the Exchange Rate.
 */
export function orderReadModel(fields: OrderReadModelFields = {}): OrderReadModel {
  const { cities, customers, drivers, trucks, currencies } = orderChoices();
  const [plock] = cities;
  const {
    status = { id: 1, name: 'w trakcie' },
    customer = customers[0],
    driver = drivers[0],
    truck = trucks[0],
    currency = currencies[0],
    priceCurrency = '1000',
    exchangeRate = '1.0000',
  } = fields;

  return {
    id: 1,
    createdAt: '2026-10-20 10:00:00',
    updatedAt: '2026-10-20 10:00:00',
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    priceCurrency,
    pricePLN: toPricePLN(priceCurrency, exchangeRate),
    exchangeRate,
    exchangeDate: null,
    loadingPlaces: [plock],
    unloadingPlaces: [plock],
    ...fields,
    status,
    statusId: status.id,
    customer,
    customerId: customer.id,
    driver,
    driverId: driver.id,
    truck,
    truckId: truck.id,
    currency,
    currencyId: currency.id,
  };
}
