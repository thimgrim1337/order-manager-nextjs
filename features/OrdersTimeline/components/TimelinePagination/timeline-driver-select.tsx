import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderData } from '@/features/shared/context/order-context';
import useTimelineQuery from '../../hooks/use-timeline-query';

export default function TimelinePaginationDriverSelect() {
  const { query, change } = useTimelineQuery();
  const { drivers } = useOrderData();

  const driverItems = drivers.map((driver) => ({
    label: `${driver.firstName} ${driver.lastName}`,
    value: driver.id,
  }));

  return (
    <Select
      items={driverItems}
      value={query.driverId ?? null}
      onValueChange={(value) => change({ driverId: value ? +value : undefined })}
    >
      <SelectTrigger className={'min-w-45'}>
        <SelectValue placeholder="Wszyscy kierowcy"></SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectItem value={null}>Wszyscy</SelectItem>
          {driverItems.map((driver) => (
            <SelectItem key={driver.value} value={driver.value}>
              {driver.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
