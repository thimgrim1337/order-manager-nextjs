import CreateOrder from '@/features/OrderForm/components/create-order';
import OrderChoicesLoader from '@/features/shared/components/order-choices-loader';
import type { RawSearchParams } from '@/features/shared/lib/search-param-parsers';
import { getAllOrders } from '@/lib/dal/order.dal';
import { parse } from '../lib/orders-table-query';
import OrderTableFilter from './OrdersFilter/orders-table-filter';
import OrdersTable from './orders-table';

type OrdersContentProps = {
  searchParamsPromise: Promise<RawSearchParams>;
};

export default async function OrdersContent({ searchParamsPromise }: OrdersContentProps) {
  const query = parse(await searchParamsPromise);

  const { data: orders, count } = await getAllOrders(query);

  return (
    <OrderChoicesLoader>
      <div className="flex gap-2 justify-between my-5">
        <OrderTableFilter />
        <CreateOrder />
      </div>

      <OrdersTable orders={orders} count={count} />
    </OrderChoicesLoader>
  );
}
