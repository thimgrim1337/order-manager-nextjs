import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/lib/consts';
import { SearchParams } from '@/types/types';
import { sortToState } from '@/lib/utils';
import { getAllOrders } from '@/lib/dal/ordersDAL';
import OrdersTable from '@/components/OrdersTable/orders-table';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sort = (await searchParams)?.sort || '';
  const globalFilters = (await searchParams)?.globalFilters || '';
  const pageIndex = (await searchParams)?.pageIndex || DEFAULT_PAGE_INDEX;
  const pageSize = (await searchParams)?.pageSize || DEFAULT_PAGE_SIZE;

  const sortOptions = sortToState(sort)[0];

  const { data: orders, rowCount } = await getAllOrders(
    pageIndex,
    pageSize,
    sortOptions,
    globalFilters
  );

  return (
    <>
      <h1>Orders</h1>
      <OrdersTable data={orders} rowCount={rowCount} />
    </>
  );
}
