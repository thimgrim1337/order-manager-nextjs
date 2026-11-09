import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as timelineQuery from '@/features/OrdersTimeline/lib/timeline-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { type Week, weekNumber, weeksOfYear, weekYear } from '@/lib/week';

export default function TimelinePaginationWeekSelect() {
  const { query, change } = useUrlQuery(timelineQuery);

  const weekItems = weeksOfYear(weekYear(query.week)).map((week) => ({
    label: weekNumber(week),
    value: week,
  }));

  return (
    <Select
      items={weekItems}
      value={query.week}
      onValueChange={(week: Week | null) => {
        if (week) change({ week });
      }}
    >
      <SelectTrigger aria-label="Tydzień">
        <SelectValue />
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
