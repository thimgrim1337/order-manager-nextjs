import { Calendar1, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, getToday, getWeek, subDays } from '@/lib/dates';
import type { Day } from '@/types/types';
import useTimelineQuery from '../../hooks/use-timeline-query';
import TimelinePaginationWeekSelect from './timeline-week-select';

export default function TimelinePaginationWeekNavigation({ weekdays }: { weekdays: Day[] }) {
  const { change } = useTimelineQuery();
  const firstDayOfWeek = weekdays[0].date;
  const selectedWeekNumber = getWeek(firstDayOfWeek);

  function handlePrevious() {
    change({ week: subDays(firstDayOfWeek, 7) });
  }

  function handleForward() {
    change({ week: addDays(firstDayOfWeek, 7) });
  }

  function handlePresent() {
    change({ week: getToday() });
  }

  return (
    <div className="flex gap-2 justify-end items-center">
      <TimelinePaginationWeekSelect selectedWeekNumber={selectedWeekNumber} />
      <Button variant={'outline'} onClick={handlePrevious}>
        <ChevronLeft />
      </Button>
      <Button variant={'outline'} onClick={handlePresent}>
        <Calendar1 />
      </Button>
      <Button variant={'outline'} onClick={handleForward}>
        <ChevronRight />
      </Button>
    </div>
  );
}
