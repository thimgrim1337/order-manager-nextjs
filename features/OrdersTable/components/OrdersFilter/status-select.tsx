import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderData } from '@/features/shared/context/order-context';
import type { Status } from '@/types/types';
import useOrdersTableQuery from '../../hooks/use-orders-table-query';

export default function StatusSelect() {
  const { statuses } = useOrderData();
  const { query, change } = useOrdersTableQuery();

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
