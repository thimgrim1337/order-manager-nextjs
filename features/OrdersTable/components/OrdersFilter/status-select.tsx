import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import {
  STATUS_PRESENTATIONS,
  type StatusPresentation,
} from '@/features/shared/lib/status-presentation';

export default function StatusSelect() {
  const { query, change } = useUrlQuery(ordersTableQuery);

  return (
    <Select
      value={STATUS_PRESENTATIONS.find((status) => status.id === query.statusId) ?? null}
      itemToStringLabel={(status: StatusPresentation) => status.label}
      itemToStringValue={(status) => String(status.id)}
      onValueChange={(value) => change({ statusId: value?.id })}
    >
      <SelectTrigger className="w-45">
        <SelectValue placeholder="Wybierz status zlecenia"></SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectItem value={null}>Wszystkie</SelectItem>
        {STATUS_PRESENTATIONS.map((status) => (
          <SelectItem key={status.id} value={status}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
