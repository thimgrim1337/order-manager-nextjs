import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type Week, weekNumber, weeksOfYear, weekYear } from '@/lib/week';
import useTimelineQuery from '../../hooks/use-timeline-query';

export default function TimelinePaginationWeekSelect() {
  const { query, change } = useTimelineQuery();

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
      <SelectTrigger aria-label="Week">
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
