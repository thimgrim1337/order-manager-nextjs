'use client';

import useTable from '../hooks/useTable';
import { columns } from '../columns';
import OrderTableFilter from './orders-table-filter';
import { OrdersTableBody } from './orders-table-body';
import { OrdersTablePagination } from './orders-table-pagination';
import { use } from 'react';
import { OrderDto as Order } from '@/lib/dto/order.dto';

interface OrdersTableProps {
  orders: Promise<Order[]>;
  rowCount: number;
}

export default function OrdersTable({ orders, rowCount }: OrdersTableProps) {
  const ordersData = use(orders);

  const table = useTable({
    columns,
    data: ordersData,
    rowCount,
  });

  return (
    <>
      <OrderTableFilter />
      <OrdersTableBody columns={columns} table={table} />
      <OrdersTablePagination table={table} />
    </>
  );
}
