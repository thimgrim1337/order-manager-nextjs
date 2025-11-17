import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useFilters } from './useFilters';
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@/lib/consts';
import { sortToState, stateToSort } from '@/lib/utils';

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
  const { filters, setFilters } = useFilters();
  const PaginationState = {
    pageIndex: filters.pageIndex ?? DEFAULT_PAGE_INDEX,
    pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
  };
  const sortState = sortToState(filters.sort);

  const table = useReactTable({
    data,
    columns,
    rowCount: rowCount,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (pagination) => {
      setFilters(
        typeof pagination === 'function'
          ? pagination(PaginationState)
          : pagination
      );
    },
    onSortingChange: (sorter) => {
      const newSortingState =
        typeof sorter === 'function' ? sorter(sortState) : sorter;
      return setFilters({ sort: stateToSort(newSortingState) });
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      sorting: sortState,
      pagination: PaginationState,
    },
  });

  return table;
}
