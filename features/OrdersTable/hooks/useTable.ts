import {
  type ColumnDef,
  getCoreRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ORDER_SORT_FIELDS, type OrderSortField } from '@/lib/consts';
import useOrdersTableQuery from './use-orders-table-query';

type useTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  rowCount: number;
};

export default function useTable<TData, TValue>({
  columns,
  data,
  rowCount,
}: useTableProps<TData, TValue>) {
  const { query, change } = useOrdersTableQuery();
  const paginationState = { pageIndex: query.pageIndex, pageSize: query.pageSize };
  const sortState: SortingState = [query.sort];

  const table = useReactTable({
    data,
    columns,
    rowCount: rowCount,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (pagination) => {
      change(typeof pagination === 'function' ? pagination(paginationState) : pagination);
    },
    onSortingChange: (sorter) => {
      const [sort] = typeof sorter === 'function' ? sorter(sortState) : sorter;
      if (!sort) return change({ sort: undefined });
      if (isOrderSortField(sort.id)) change({ sort: { id: sort.id, desc: sort.desc } });
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    // A sort is always applied (newest Start Date first by default), so headers toggle asc/desc only.
    enableSortingRemoval: false,
    state: {
      sorting: sortState,
      pagination: paginationState,
    },
  });

  return table;
}

function isOrderSortField(id: string): id is OrderSortField {
  return (ORDER_SORT_FIELDS as readonly string[]).includes(id);
}
