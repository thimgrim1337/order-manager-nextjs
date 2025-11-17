'use client';

import { OrdersTableBody } from './orders-table-body';
import OrderTableFilter from './orders-table-filter';
import { OrdersTablePagination } from './orders-table-pagination';
import { columns } from './columns';
import useTable from './useTable';
import { Order } from '@/types/types';

interface OrdersTableProps {
  data: Order[];
  rowCount: number;
}

export default function OrdersTable({ data, rowCount }: OrdersTableProps) {
  const table = useTable({ columns, data, rowCount });

  return (
    <>
      <OrderTableFilter />
      <OrdersTableBody columns={columns} table={table} />
      <OrdersTablePagination table={table} />
    </>
  );
}
