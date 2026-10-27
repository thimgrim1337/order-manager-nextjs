import { TableCell } from '@/components/ui/table';
import StatusBadge from '@/features/OrdersTable/components/ui/status-bagde';
import type { Order } from '@/types/types';

export default function TimelineDetailsCell({ order }: { order: Order }) {
  return (
    <TableCell className="flex flex-col justify-center ">
      <span className="">{order.truck.plate}</span>
      <span className="text-xs text-muted-foreground mb-1">
        {order.driver.firstName} {order.driver.lastName}
      </span>
      <StatusBadge status={order.status} />
    </TableCell>
  );
}
