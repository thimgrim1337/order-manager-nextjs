import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { columns, fromSortingState, toSortingState } from '@/features/OrdersTable/lib/columns';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import type { OrderReadModel } from '@/lib/dal/order.dal';

type useTableProps = {
  orders: OrderReadModel[];
  rowCount: number;
};

/** The Orders Table over one page of Orders, its sort and page held in the URL. */
export default function useTable({ orders, rowCount }: useTableProps) {
  const { query, change } = useUrlQuery(ordersTableQuery);
  const paginationState = { pageIndex: query.pageIndex, pageSize: query.pageSize };
  const sortingState = toSortingState(query.sort);

  return useReactTable({
    data: orders,
    columns,
    rowCount,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (pagination) => {
      change(typeof pagination === 'function' ? pagination(paginationState) : pagination);
    },
    onSortingChange: (sorting) => {
      change({
        sort: fromSortingState(typeof sorting === 'function' ? sorting(sortingState) : sorting),
      });
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    // A sort is always applied (newest Start Date first by default), so headers toggle asc/desc only.
    enableSortingRemoval: false,
    state: {
      sorting: sortingState,
      pagination: paginationState,
    },
  });
}
