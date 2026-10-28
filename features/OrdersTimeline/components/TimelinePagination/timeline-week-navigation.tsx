import { Calendar1, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { currentWeek, nextWeek, prevWeek } from '@/lib/week';
import useTimelineQuery from '../../hooks/use-timeline-query';
import TimelinePaginationWeekSelect from './timeline-week-select';

export default function TimelinePaginationWeekNavigation() {
  const { query, change } = useTimelineQuery();

  function handlePrevious() {
    change({ week: prevWeek(query.week) });
  }

  function handleForward() {
    change({ week: nextWeek(query.week) });
  }

  function handlePresent() {
    change({ week: currentWeek() });
  }

  return (
    <div className="flex gap-2 justify-end items-center">
      <TimelinePaginationWeekSelect />
      <Button variant={'outline'} onClick={handlePrevious} aria-label="Previous week">
        <ChevronLeft />
      </Button>
      <Button variant={'outline'} onClick={handlePresent} aria-label="Current week">
        <Calendar1 />
      </Button>
      <Button variant={'outline'} onClick={handleForward} aria-label="Next week">
        <ChevronRight />
      </Button>
    </div>
  );
}
