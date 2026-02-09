'use client';

import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/lib/dates';
import { OrderDto as Order } from '@/lib/dto/order.dto';

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'orderNr',
    header: 'Nr zlecenia',
  },
  {
    accessorKey: 'startDate',
    accessorFn: (order) => formatDate(order.startDate),
    header: 'Data załadunku',
  },
  {
    accessorKey: 'endDate',
    accessorFn: (order) => formatDate(order.endDate),
    header: 'Data rozładunku',
  },
  {
    accessorKey: 'loadingCity',
    header: ' Miejsce załadunku',
  },
  {
    accessorKey: 'unloadingCity',
    header: 'Miejsce rozładunku',
  },
  {
    accessorKey: 'statusId',
    cell: ({ row }) => {
      const statusId = row.getValue('statusId') as number;

      return statusId;
      // <StatusBadge statusID={statusID}> {row.original.status}</StatusBadge>
    },
    header: 'Status',
  },
  {
    accessorKey: 'truckId',
    accessorFn: (order) => order.truck,
    header: 'Pojazd',
  },
  {
    accessorKey: 'driverId',
    accessorFn: (order) => order.driver,
    header: 'Kierowca',
  },
  {
    accessorKey: 'customerId',
    accessorFn: (order) => order.customer,
    header: 'Klient',
  },
  {
    accessorKey: 'priceCurrency',
    header: 'Cena',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('priceCurrency'));
      const formatted = new Intl.NumberFormat('pl-PL').format(price);
      return <div className='text-right font-medium'>{formatted}</div>;
    },
  },

  {
    accessorKey: 'currency',
    header: 'Waluta',
    cell: ({ row }) => (
      <div className='text-right font-medium'>{row.getValue('currency')}</div>
    ),
  },
  {
    accessorKey: 'pricePLN',
    header: 'Cena (PLN)',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('pricePLN'));

      const formatted = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
      }).format(price);
      return (
        <div className='text-right font-medium text-red-600 '>{formatted}</div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const order = row.original;

      //   return <OrderOptions order={order} />;
    },
  },
];
