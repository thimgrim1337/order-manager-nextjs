import z from 'zod';
import CreateOrder from '@/features/OrderForm/components/create-order';
import { OrderDataProvider } from '@/features/shared/context/order-context';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/lib/consts';
import { getAllCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllOrders } from '@/lib/dal/order.dal';
import { getAllStatuses } from '@/lib/dal/status.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import { pick } from '@/lib/helpers';
import { sortToState } from '@/lib/utils';
import { type RawSearchParams, SearchParams } from '@/types/types';
import OrderTableFilter from './OrdersFilter/orders-table-filter';
import OrdersTable from './orders-table';

type OrdersContentProps = {
  searchParamsPromise: Promise<RawSearchParams>;
};

export default async function OrdersContent({ searchParamsPromise }: OrdersContentProps) {
  const {
    data: validatedSearchParams,
    success,
    error,
  } = SearchParams.safeParse(await searchParamsPromise);

  if (!success) console.log('Błąd walidacji SearchParams: ', z.prettifyError(error));

  const sort = validatedSearchParams?.sort || '';
  const sortParams = sortToState(sort);
  const pageIndex = validatedSearchParams?.pageIndex || DEFAULT_PAGE_INDEX;
  const pageSize = validatedSearchParams?.pageSize || DEFAULT_PAGE_SIZE;
  const globalFilters = validatedSearchParams?.globalFilters;
  const startDate = validatedSearchParams?.startDate;
  const endDate = validatedSearchParams?.endDate;
  const driverId = validatedSearchParams?.driverId;
  const statusId = validatedSearchParams?.statusId;

  const { data, count } = await getAllOrders(pageIndex, pageSize, sortParams, {
    startDate,
    endDate,
    driverId,
    statusId,
    globalFilters,
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
