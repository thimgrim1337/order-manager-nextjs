import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { orderDays } from '@/lib/order-day';
import type { Week } from '@/lib/week';
import { timelineColor } from '../lib/timeline-color';
import TimelineOrder from './timeline-order';

export default function TimelineBody({
  week,
  orders,
  countries,
}: {
  week: Week;
  orders: OrderReadModel[];
  countries: CountryReadModel[];
}) {
  return (
    <TableBody>
      {orders.length ? (
        orders.map((order) => (
          <TimelineOrder
            key={order.id}
            order={order}
            days={orderDays(week, order, countries)}
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
