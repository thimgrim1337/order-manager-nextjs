'use client';

import type { OrderReadModel } from '@/lib/dal/order.dal';
import useTable from '../hooks/useTable';
import { columns } from '../lib/columns';
import { OrdersTableBody } from './orders-table-body';
import { OrdersTablePagination } from './orders-table-pagination';

interface OrdersTableProps {
  orders: OrderReadModel[];
  count: number;
}

export default function OrdersTable({ orders, count }: OrdersTableProps) {
  const table = useTable({
    columns,
    data: orders,
    rowCount: count,
  });

  return (
    <>
      <OrdersTableBody columns={columns} table={table} />
      <OrdersTablePagination table={table} />
    </>
  );
}
