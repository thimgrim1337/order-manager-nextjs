import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as timelineQuery from '@/features/OrdersTimeline/lib/timeline-query';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { driverName } from '@/lib/drivers';

export default function TimelinePaginationDriverSelect() {
  const { query, change } = useUrlQuery(timelineQuery);
  const { drivers } = useOrderChoices();

  const driverItems = drivers.map((driver) => ({
    label: driverName(driver),
    value: driver.id,
  }));

  return (
    <Select
      items={driverItems}
      value={query.driverId ?? null}
      onValueChange={(value) => change({ driverId: value ? +value : undefined })}
    >
      <SelectTrigger className={'min-w-45'} aria-label="Kierowca">
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
