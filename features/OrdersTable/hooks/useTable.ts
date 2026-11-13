import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useEffectEvent } from 'react';
import { columns, fromSortingState, toSortingState } from '@/features/OrdersTable/lib/columns';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { existingPageIndex } from '@/lib/pagination';

type useTableProps = {
  orders: OrderReadModel[];
  rowCount: number;
};

/**
 * The Orders Table over one page of Orders, its sort and page held in the URL. A page past the
 * last shows as the last, and the URL is corrected to it.
 */
export default function useTable({ orders, rowCount }: useTableProps) {
  const { query, change } = useUrlQuery(ordersTableQuery);
  const pageIndex = existingPageIndex(query.pageIndex, query.pageSize, rowCount);
  const paginationState = { pageIndex, pageSize: query.pageSize };
  const sortingState = toSortingState(query.sort);

  // Built on the latest query: a change still navigating may already have moved the page. Its
  // filters are the rendered ones (any other change goes back to the first page), so `rowCount` holds.
  const showExistingPage = useEffectEvent(() => {
    change((current) => ({
      pageIndex: existingPageIndex(current.pageIndex, current.pageSize, rowCount),
    }));
  });

  useEffect(() => {
    if (pageIndex !== query.pageIndex) showExistingPage();
  }, [pageIndex, query.pageIndex]);

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
