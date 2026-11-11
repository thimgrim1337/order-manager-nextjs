import type { OrderReadModel } from '@/lib/dal/order.dal';
import { toPricePLN } from '@/lib/exchange-rate';
import { orderChoices } from '../utils/order-choices';

/** PLN, as a PLN Order (which has no Exchange Rate) is read with it. */
const pln: OrderReadModel['currency'] = { id: 1, code: 'PLN', rate: 1, date: '' };

/**
 * An Order read model for a browser test: ZL/1, PLN 1000, in progress, 2026-10-27 → 2026-10-29,
 * Płock → Płock, with DEVIL, Jan and WND0997C from `orderChoices`. Unless overridden, the PLN Price
 * is the Price at the Currency's Exchange Rate, so a foreign-Currency Order is one `currency`
 * override away.
 */
export function orderReadModel(fields: Partial<OrderReadModel> = {}): OrderReadModel {
  const { cities, customers, drivers, trucks } = orderChoices();
  const [plock] = cities;
  const { currency = pln, priceCurrency = '1000' } = fields;

  return {
    id: 1,
    orderNr: 'ZL/1',
    startDate: '2026-10-27',
    endDate: '2026-10-29',
    status: { id: 1, name: 'w trakcie' },
    customer: customers[0],
    driver: drivers[0],
    truck: trucks[0],
    currency,
    priceCurrency,
    pricePLN: toPricePLN(priceCurrency, String(currency.rate)),
    loadingPlaces: [plock],
    unloadingPlaces: [plock],
    ...fields,
  };
}
