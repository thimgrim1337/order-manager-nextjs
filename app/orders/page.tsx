import { Suspense } from 'react';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/lib/consts';
import { SearchParams } from '@/types/types';
import { sortToState } from '@/lib/utils';
import OrdersTable from '@/features/OrdersTable/components/orders-table';
import PageHeader from '@/components/ui/page-header';
import CreateOrder from '@/features/OrderForm/components/create-order';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllOrders, getOrderCount } from '@/lib/dal/order.dal';
import { getAllCities } from '@/lib/dal/city.dal';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sort = (await searchParams)?.sort || '';
  const globalFilters = (await searchParams)?.globalFilters || '';
  const pageIndex =
    Number((await searchParams)?.pageIndex) || DEFAULT_PAGE_INDEX;
  const pageSize = Number((await searchParams)?.pageSize) || DEFAULT_PAGE_SIZE;
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

      <Suspense fallback={<p>Loading...</p>}>
        <CreateOrder
          customers={customers}
          cities={cities}
          drivers={drivers}
          trucks={trucks}
          countries={countries}
        />
        <OrdersTable orders={orders} rowCount={rowCount[0].count} />
      </Suspense>
    </>
  );
}
