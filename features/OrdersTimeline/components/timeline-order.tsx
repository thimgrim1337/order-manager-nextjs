'use client';

import { TableRow } from '@/components/ui/table';
import EditOrderDialog from '@/features/OrderForm/components/edit-order-dialog';
import { useWriteDialog } from '@/features/shared/hooks/use-write-dialog';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { orderDays } from '@/lib/order-day';
import type { Week } from '@/lib/week';
import { timelineColor } from '../lib/timeline-color';
import TimelineDetailsCell from './timeline-details';
import TimelinePlaceCell from './timeline-place';

/** An Order's row on the Timeline: its Order Days in the Week, in its own colour. */
export default function TimelineOrder({ week, order }: { week: Week; order: OrderReadModel }) {
  const borderColor = timelineColor(order.id);
  const editDialog = useWriteDialog();

  return (
    <>
      <TableRow onClick={editDialog.open} className="hover:cursor-pointer">
        <TimelineDetailsCell order={order} />
        {orderDays(week, order).map((day) => (
          <TimelinePlaceCell key={day.date} day={day} borderColor={borderColor} />
        ))}
      </TableRow>
      <EditOrderDialog order={order} dialog={editDialog} />
    </>
  );
}
