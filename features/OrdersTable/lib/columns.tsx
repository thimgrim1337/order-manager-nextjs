'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { OrderSortField } from '@/lib/consts';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { formatDate } from '@/lib/dates';
import StatusBadge from '../components/ui/status-bagde';

/** Every column is sortable: its `accessorKey` is its id, and the id is the sort field the URL and DAL read. */
type OrderColumn = ColumnDef<OrderReadModel> & { accessorKey: OrderSortField };

export const columns: OrderColumn[] = [
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
    accessorFn: (order) => order.loadingPlaces[0].name,
    header: ' Miejsce załadunku',
  },
  {
    accessorKey: 'unloadingCity',
    accessorFn: (order) => order.unloadingPlaces[order.unloadingPlaces.length - 1].name,
    header: 'Miejsce rozładunku',
  },
  {
    accessorKey: 'statusId',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    header: 'Status',
  },
  {
    accessorKey: 'truckPlate',
    accessorFn: (order) => order.truck.plate,
    header: 'Pojazd',
  },
  {
    accessorKey: 'driverFullname',
    accessorFn: (order) => `${order.driver.firstName} ${order.driver.lastName}`,
    header: 'Kierowca',
  },
  {
    accessorKey: 'customerName',
    cell: ({ row }) => <div className="w-40 truncate">{row.original.customer.name}</div>,
    header: 'Klient',
  },
  {
    accessorKey: 'priceCurrency',
    header: 'Cena',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('priceCurrency'));
      const formatted = new Intl.NumberFormat('pl-PL').format(price);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },

  {
    accessorKey: 'currencyId',
    header: 'Waluta',
    cell: ({ row }) => <div className="text-right">{row.original.currency.code}</div>,
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
      return <div className="text-right font-medium text-red-600 ">{formatted}</div>;
    },
  },
];
