import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderData } from '@/features/shared/context/order-context';
import useFilters from '@/features/shared/hooks/use-filters';
import type { Status } from '@/types/types';

export default function StatusSelect() {
  const { statuses } = useOrderData();
  const { setFilters } = useFilters();

  return (
    <Select
      itemToStringLabel={(status: Status) => status.name}
      itemToStringValue={(status) => String(status.id)}
      onValueChange={(value) =>
        setFilters({
          statusId: value?.id,
        })
      }
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
