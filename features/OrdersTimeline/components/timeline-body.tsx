import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { getAllOrders } from '@/lib/dal/order.dal';
import type { Order, TimelineFilters } from '@/types/types';
import TimelineOrder from './timeline-order';

const borderColors = [
  'border-chart-1',
  'border-chart-2',
  'border-chart-3',
  'border-chart-4',
  'border-chart-5',
];

async function getOrders(filters?: TimelineFilters): Promise<Order[]> {
  const orders = await getAllOrders(
    0,
    10,
    [
      { id: 'truckId', desc: false },
      { id: 'startDate', desc: false },
    ],
    filters,
  );

  return orders;
}

export default async function TimelineBody({ filters }: { filters: TimelineFilters }) {
  const orders = await getOrders({
    startDate: filters.startDate,
    endDate: filters.endDate,
    driverId: filters?.driverId,
  });

  const borderColorsMap = orders.reduce(
    (acc, order, index) => {
      const color = borderColors[index];
      acc[order.id] = color;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <TableBody>
      {orders.length ? (
        orders.map((order) => (
          <TimelineOrder key={order.id} order={order} borderColor={borderColorsMap[order.id]} />
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={100} className="text-center font-semibold py-4 ">
            Brak zleceń
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
