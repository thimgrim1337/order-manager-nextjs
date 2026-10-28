import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { orderDays, type Week } from '@/lib/week';
import type { Order } from '@/types/types';
import TimelineOrder from './timeline-order';

const borderColors = [
  'border-chart-1',
  'border-chart-2',
  'border-chart-3',
  'border-chart-4',
  'border-chart-5',
];

export default function TimelineBody({ week, orders }: { week: Week; orders: Order[] }) {
  const borderColorsMap = orders.reduce(
    (acc, order, index) => {
      const color = borderColors[index % borderColors.length];
      acc[order.id] = color;
      return acc;
    },
    {} as Record<string, string>,
  );

  return (
    <TableBody>
      {orders.length ? (
        orders.map((order) => (
          <TimelineOrder
            key={order.id}
            order={order}
            days={orderDays(week, order)}
            borderColor={borderColorsMap[order.id]}
          />
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
