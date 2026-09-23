'use client';

import { type ColumnDef, flexRender, type Table } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { Order } from '@/types/types';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Table as TableMain,
  TableRow,
} from '../../../components/ui/table';
import OrdersContextMenu from './OrdersContextMenu/context-menu';

interface OrdersTableBodyProps<TData, TValue> {
  table: Table<TData>;
  columns: ColumnDef<TData, TValue>[];
}

export function OrdersTableBody<TData, TValue>({
  table,
  columns,
}: OrdersTableBodyProps<TData, TValue>) {
  return (
    <TableMain>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className="font-semibold md:text-xs">
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className={`flex gap-1 items-center justify-start ${
                        header.column.getCanSort() ? 'cursor-pointer select-none group' : ''
                      } `}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort()
                        ? {
                            asc: <ArrowUp className="max-w-4 opacity-0 group-hover:opacity-100" />,
                            desc: (
                              <ArrowDown className="max-w-4 opacity-0 group-hover:opacity-100" />
                            ),
                            false: (
                              <ArrowUpDown className="max-w-4 opacity-0 group-hover:opacity-100" />
                            ),
                          }[header.column.getIsSorted() as string]
                        : null}
                    </button>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <OrdersContextMenu key={row.id} order={row.original as Order}>
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="group lg:text-xs cursor-pointer"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            </OrdersContextMenu>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center ">
              Brak wyników.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableMain>
  );
}
