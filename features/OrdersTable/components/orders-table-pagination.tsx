import { Table } from '@tanstack/react-table';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';

interface DataTablePagination<TData> {
  table: Table<TData>;
}

export function OrdersTablePagination<TData>({
  table,
}: DataTablePagination<TData>) {
  return (
    <div className='flex items-center justify-between p-2'>
      <div className='flex-1 text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} {' z '}
        {table.getFilteredRowModel().rows.length} wiersz(y) zaznaczono.
      </div>
      <div className='flex items-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>Wierszy na stronę</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex items-center space-x-2'>
        <Button
          variant={'outline'}
          className='hidden h-8 w-8 p-0 lg:flex'
          onClick={() => {
            table.setPageIndex(0);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Wróć do pierwszej strony</span>
          <ChevronsLeft />
        </Button>
        <Button
          variant={'outline'}
          className='hidden h-8 w-8 p-0 lg:flex'
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          <span className='sr-only'>Wróć do poprzedniej strony</span>
          <ChevronLeft />
        </Button>
        <Button
          variant={'outline'}
          className='hidden h-8 w-8 p-0 lg:flex'
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Idź do kolejnej strony</span>
          <ChevronRight />
        </Button>
        <Button
          variant={'outline'}
          className='hidden h-8 w-8 p-0 lg:flex'
          onClick={() => {
            table.setPageIndex(table.getPageCount() - 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          <span className='sr-only'>Idź do ostatniej strony</span>
          <ChevronsRight />
        </Button>
      </div>
      <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
        Strona {table.getState().pagination.pageIndex + 1} {' z '}
        {table.getPageCount()}
      </div>
    </div>
  );
}
