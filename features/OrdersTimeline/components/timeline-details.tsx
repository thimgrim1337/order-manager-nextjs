import { TableCell } from '@/components/ui/table';
import StatusBadge from '@/features/OrdersTable/components/ui/status-bagde';
import type { OrderReadModel } from '@/lib/dal/order.dal';
import { driverName } from '@/lib/drivers';

export default function TimelineDetailsCell({ order }: { order: OrderReadModel }) {
  return (
    <TableCell className="flex flex-col justify-center ">
      <span className="">{order.truck.plate}</span>
      <span className="text-xs text-muted-foreground mb-1">{driverName(order.driver)}</span>
      <StatusBadge status={order.status} />
    </TableCell>
  );
}
