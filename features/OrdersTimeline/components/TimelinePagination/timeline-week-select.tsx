import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useTimelineQuery from '../../hooks/use-timeline-query';
import { getWeeksStartDates } from '../../lib/helpers';

export default function TimelinePaginationWeekSelect({
  selectedWeekNumber,
}: {
  selectedWeekNumber: number;
}) {
  const { change } = useTimelineQuery();

  const weekItems = getWeeksStartDates().map((week) => ({
    label: week.weekNumber,
    value: week.weekNumber,
    startDate: week.startDate,
    endDate: week.endDate,
  }));

  return (
    <Select
      items={weekItems}
      value={selectedWeekNumber}
      onValueChange={(value) => {
        const week = weekItems.filter((week) => week.value === value)[0];
        change({ week: week.startDate });
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={selectedWeekNumber}></SelectValue>
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} className={'min-w-15'}>
        <SelectGroup>
          {weekItems.map((week) => (
            <SelectItem key={week.value} value={week.value}>
              {week.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
