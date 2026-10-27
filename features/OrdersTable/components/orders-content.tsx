import CreateOrder from '@/features/OrderForm/components/create-order';
import { OrderDataProvider } from '@/features/shared/context/order-context';
import { getAllCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllOrders } from '@/lib/dal/order.dal';
import { getAllStatuses } from '@/lib/dal/status.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import { pick } from '@/lib/helpers';
import type { RawSearchParams } from '@/types/types';
import { parse } from '../lib/orders-table-query';
import OrderTableFilter from './OrdersFilter/orders-table-filter';
import OrdersTable from './orders-table';

type OrdersContentProps = {
  searchParamsPromise: Promise<RawSearchParams>;
};

export default async function OrdersContent({ searchParamsPromise }: OrdersContentProps) {
  const query = parse(await searchParamsPromise);

  const { data, count } = await getAllOrders(query.pageIndex, query.pageSize, [query.sort], {
    globalFilters: query.search,
    startDate: query.startDate,
    endDate: query.endDate,
    driverId: query.driverId,
    statusId: query.statusId,
  });

  const orders = data.map((d) =>
    pick(d, [
      'id',
      'currency',
      'customer',
      'driver',
      'startDate',
      'endDate',
      'loadingPlaces',
      'unloadingPlaces',
      'orderNr',
      'priceCurrency',
      'pricePLN',
      'status',
      'truck',
    ]),
  );

  const [customers, cities, drivers, trucks, countries, currencies, statuses] = await Promise.all([
    getAllCustomers(),
    getAllCities(),
    getAllDrivers(),
    getAllTrucks(),
    getAllCountries(),
    getAllCurrencies(),
    getAllStatuses(),
  ]);

  return (
    <OrderDataProvider
      data={{
        customers,
        cities,
        drivers,
        trucks,
        countries,
        currencies,
        statuses,
      }}
    >
      <div className="flex gap-2 justify-between my-5">
        <OrderTableFilter />
        <CreateOrder />
      </div>

      <OrdersTable orders={orders} count={count} />
    </OrderDataProvider>
  );
}
