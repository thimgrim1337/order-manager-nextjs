'use client';

import { ColumnDef, flexRender, Table } from '@tanstack/react-table';
import {
  Table as TableMain,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

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
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (
                    <>
                      <div
                        className={`flex gap-2 items-center justify-start ${
                          header.column.getCanSort()
                            ? 'cursor-pointer select-none group'
                            : ''
                        } `}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort()
                          ? {
                              asc: (
                                <ArrowUp className='max-w-4 opacity-0 group-hover:opacity-100' />
                              ),
                              desc: (
                                <ArrowDown className='max-w-4 opacity-0 group-hover:opacity-100' />
                              ),
                              false: (
                                <ArrowUpDown className='max-w-4 opacity-0 group-hover:opacity-100' />
                              ),
                            }[header.column.getIsSorted() as string]
                          : null}
                      </div>
                    </>
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
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className='h-24 text-center'>
              Brak wyników.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableMain>
  );
}
