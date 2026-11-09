'use client';

import { TableRow } from '@/components/ui/table';
import EditOrderDialog from '@/features/OrderForm/components/edit-order-dialog';
import useToggle from '@/features/shared/hooks/use-toggle';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import type { OrderDay } from '@/lib/order-day';
import TimelineDetailsCell from './timeline-details';
import TimelinePlaceCell from './timeline-place';

export default function TimelineOrder({
  order,
  days,
  borderColor,
}: {
  order: OrderReadModel;
  days: OrderDay[];
  borderColor: string;
}) {
  const [isModalOpen, { setValue: setIsModalOpen, setTrue: openModal }] = useToggle();

  return (
    <>
      <TableRow key={order.id} onClick={() => openModal()} className="hover:cursor-pointer">
        <TimelineDetailsCell key={order.id} order={order} />
        {days.map((day) => (
          <TimelinePlaceCell key={day.date} day={day} borderColor={borderColor} />
        ))}
      </TableRow>
      <EditOrderDialog order={order} isModalOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
