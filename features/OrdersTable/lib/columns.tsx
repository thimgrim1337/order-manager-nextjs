import type { ColumnDef, ColumnDefBase, SortingState } from '@tanstack/react-table';
import StatusBadge from '@/features/shared/components/ui/status-badge';
import type { OrderReadModel, OrderSortField, SortParams } from '@/lib/dal/order.dal';
import { formatDate } from '@/lib/dates';
import { driverName } from '@/lib/drivers';
import { firstLoadingPlace, lastUnloadingPlace } from '@/lib/places';

type OrderColumn = ColumnDefBase<OrderReadModel> & {
  accessorFn: (order: OrderReadModel) => unknown;
  header: string;
};

/**
 * The Orders Table's columns, in the order they show, each keyed by the field it sorts by: the
 * field its header writes to the URL's `sort` and the Order DAL orders on. Every sort field has
 * one column. A column's value also picks the first direction its header sorts in: a text value
 * ascending, any other descending.
 */
const columnsBySortField = {
  orderNr: {
    accessorFn: (order) => order.orderNr,
    header: 'Nr zlecenia',
  },
  startDate: {
    accessorFn: (order) => formatDate(order.startDate),
    header: 'Data załadunku',
  },
  endDate: {
    accessorFn: (order) => formatDate(order.endDate),
    header: 'Data rozładunku',
  },
  loadingCity: {
    accessorFn: (order) => firstLoadingPlace(order)?.name ?? '',
    header: ' Miejsce załadunku',
  },
  unloadingCity: {
    accessorFn: (order) => lastUnloadingPlace(order)?.name ?? '',
    header: 'Miejsce rozładunku',
  },
  statusId: {
    accessorFn: (order) => order.status.id,
    cell: ({ row }) => <StatusBadge statusId={row.original.status.id} />,
    header: 'Status',
  },
  truckPlate: {
    accessorFn: (order) => order.truck.plate,
    header: 'Pojazd',
  },
  driverFullname: {
    accessorFn: (order) => driverName(order.driver),
    header: 'Kierowca',
  },
  customerName: {
    accessorFn: (order) => order.customer.name,
    cell: ({ row }) => <div className="w-40 truncate">{row.original.customer.name}</div>,
    header: 'Klient',
  },
  priceCurrency: {
    accessorFn: (order) => order.priceCurrency,
    header: 'Cena',
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('pl-PL').format(
        parseFloat(row.original.priceCurrency),
      );
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  currencyId: {
    accessorFn: (order) => order.currency.id,
    header: 'Waluta',
    cell: ({ row }) => <div className="text-right">{row.original.currency.code}</div>,
  },
  pricePLN: {
    accessorFn: (order) => order.pricePLN,
    header: 'Cena (PLN)',
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
      }).format(parseFloat(row.original.pricePLN));
      return <div className="text-right font-medium text-red-600 ">{formatted}</div>;
    },
  },
} satisfies Record<OrderSortField, OrderColumn>;

/** The fields the Orders Table sorts by. */
export const sortFields = Object.keys(columnsBySortField) as OrderSortField[];

export const columns: ColumnDef<OrderReadModel>[] = sortFields.map((field) => ({
  id: field,
  ...columnsBySortField[field],
}));

/** The table's sorting state for the Orders Table's sort. */
export function toSortingState(sort: SortParams): SortingState {
  return [{ id: sort.id, desc: sort.desc }];
}

/** The Orders Table's sort for the table's sorting state; none when it sorts by no column. */
export function fromSortingState([sorting]: SortingState): SortParams | undefined {
  const field = sortFields.find((candidate) => candidate === sorting?.id);
  return sorting && field ? { id: field, desc: sorting.desc } : undefined;
}
