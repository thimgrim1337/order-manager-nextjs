import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/lib/consts';
import { SearchParams } from '@/types/types';
import { sortToState } from '@/lib/utils';
import { getAllOrders, getOrderCount } from '@/lib/dal/ordersDAL';
import OrdersTable from '@/features/OrdersTable/components/orders-table';
import PageHeader from '@/components/ui/page-header';
import CreateOrder from '@/features/OrderForm/components/create-order';
import { Suspense } from 'react';
import { getAllCustomers } from '@/lib/dal/customersDAL';
import { getAllCities } from '@/lib/dal/cityDAL';
import getAllDrivers from '@/lib/dal/driverDAL';
import getAllTrucks from '@/lib/dal/truckDAL';
import getAllCountries from '@/lib/dal/countriesDAL';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sort = (await searchParams)?.sort || '';
  const globalFilters = (await searchParams)?.globalFilters || '';
  const pageIndex = (await searchParams)?.pageIndex || DEFAULT_PAGE_INDEX;
  const pageSize = (await searchParams)?.pageSize || DEFAULT_PAGE_SIZE;
  const customerSearch = (await searchParams)?.customer || '';

  const sortOptions = sortToState(sort)[0];
  const rowCount = await getOrderCount();

  const orders = getAllOrders(pageIndex, pageSize, sortOptions, globalFilters);
  const customers = getAllCustomers(customerSearch);
  const cities = getAllCities();
  const drivers = getAllDrivers();
  const trucks = getAllTrucks();
  const countries = getAllCountries();

  return (
    <>
      <PageHeader
        title='Zlecenia'
        subText='System zarządzania zleceniami transportowymi'
      />
      <CreateOrder
        customers={customers}
        cities={cities}
        drivers={drivers}
        trucks={trucks}
        countries={countries}
      />

      <Suspense fallback={<p>Loading...</p>}>
        <OrdersTable orders={orders} rowCount={rowCount[0].count} />
      </Suspense>
    </>
  );
}
