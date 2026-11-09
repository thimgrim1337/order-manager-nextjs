import { TableCell } from '@/components/ui/table';
import StatusBadge from '@/features/shared/components/ui/status-badge';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { driverName } from '@/lib/drivers';

export default function TimelineDetailsCell({ order }: { order: OrderReadModel }) {
  return (
    <TableCell className="flex flex-col justify-center ">
      <span className="">{order.truck.plate}</span>
      <span className="text-xs text-muted-foreground mb-1">{driverName(order.driver)}</span>
      <StatusBadge statusId={order.status.id} />
    </TableCell>
  );
}
