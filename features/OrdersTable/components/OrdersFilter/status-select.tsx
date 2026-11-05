import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import { useOrderData } from '@/features/shared/context/order-context';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import type { Status } from '@/types/types';

export default function StatusSelect() {
  const { statuses } = useOrderData();
  const { query, change } = useUrlQuery(ordersTableQuery);

  return (
    <Select
      value={statuses.find((status) => status.id === query.statusId) ?? null}
      itemToStringLabel={(status: Status) => status.name}
      itemToStringValue={(status) => String(status.id)}
      onValueChange={(value) => change({ statusId: value?.id })}
    >
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Wybierz status zlecenia"></SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value={null}>Wszystkie</SelectItem>
        {statuses?.map((status) => (
          <SelectItem key={status.id} value={status}>
            {status.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
