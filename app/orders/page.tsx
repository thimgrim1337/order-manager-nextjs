import { columns } from '@/components/OrdersTable/columns';
import { OrdersTable } from '@/components/OrdersTable/orders-table';
import { getAllOrders } from '@/lib/dal/ordersDAL';
import { sortToState } from '@/lib/utils';

const DEFAULT_PAGE_INDEX = 0;
const DEFAULT_PAGE_SIZE = 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string }>;
}) {
  const sort = (await searchParams)?.sort || '';
  const sortOptions = sortToState(sort);

  const orders = await getAllOrders(
    DEFAULT_PAGE_INDEX,
    DEFAULT_PAGE_SIZE,
    sortOptions
  );

  return (
    <div>
      <h1>Orders</h1>
      <OrdersTable columns={columns} data={orders} rowCount={0} />
    </div>
  );
}
