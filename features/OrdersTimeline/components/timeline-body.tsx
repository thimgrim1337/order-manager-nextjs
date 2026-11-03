import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { orderDays, type Week } from '@/lib/week';
import { timelineColor } from '../lib/timeline-color';
import TimelineOrder from './timeline-order';

export default function TimelineBody({ week, orders }: { week: Week; orders: OrderReadModel[] }) {
  return (
    <TableBody>
      {orders.length ? (
        orders.map((order) => (
          <TimelineOrder
            key={order.id}
            order={order}
            days={orderDays(week, order)}
            borderColor={timelineColor(order.id)}
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
