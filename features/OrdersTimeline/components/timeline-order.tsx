'use client';

import { SquarePen } from 'lucide-react';
import { TableRow } from '@/components/ui/table';
import EditOrderForm from '@/features/OrderForm/components/edit-order-form';
import Dialog from '@/features/shared/components/ui/dialog';
import useToggle from '@/features/shared/hooks/use-toggle';
import type { OrderDay } from '@/lib/week';
import type { Order } from '@/types/types';
import TimelineDetailsCell from './timeline-details';
import TimelinePlaceCell from './timeline-place';

export default function TimelineOrder({
  order,
  days,
  borderColor,
}: {
  order: Order;
  days: OrderDay[];
  borderColor: string;
}) {
  const [isModalOpen, { setValue: setIsModalOpen, setFalse: closeModal, setTrue: openModal }] =
    useToggle();

  return (
    <>
      <TableRow key={order.id} onClick={() => openModal()} className="hover:cursor-pointer">
        <TimelineDetailsCell key={order.id} order={order} />
        {days.map((day) => (
          <TimelinePlaceCell key={day.date} order={order} day={day} borderColor={borderColor} />
        ))}
      </TableRow>
      {
        <Dialog
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          title="Edycja zlecenia"
          description={`Wprowadź dane aby edytować zlecenie nr ${order.orderNr}`}
          icon={<SquarePen />}
          className="min-w-5xl"
        >
          <EditOrderForm onDialogClose={closeModal} order={order} />
        </Dialog>
      }
    </>
  );
}
