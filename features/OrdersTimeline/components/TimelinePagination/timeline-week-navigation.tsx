import { Calendar1, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as timelineQuery from '@/features/OrdersTimeline/lib/timeline-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { currentWeek, nextWeek, prevWeek } from '@/lib/week';
import TimelinePaginationWeekSelect from './timeline-week-select';

export default function TimelinePaginationWeekNavigation() {
  const { change } = useUrlQuery(timelineQuery);

  function handlePrevious() {
    change(({ week }) => ({ week: prevWeek(week) }));
  }

  function handleForward() {
    change(({ week }) => ({ week: nextWeek(week) }));
  }

  function handlePresent() {
    change({ week: currentWeek() });
  }

  return (
    <div className="flex gap-2 justify-end items-center">
      <TimelinePaginationWeekSelect />
      <Button variant={'outline'} onClick={handlePrevious} aria-label="Poprzedni tydzień">
        <ChevronLeft />
      </Button>
      <Button variant={'outline'} onClick={handlePresent} aria-label="Bieżący tydzień">
        <Calendar1 />
      </Button>
      <Button variant={'outline'} onClick={handleForward} aria-label="Następny tydzień">
        <ChevronRight />
      </Button>
    </div>
  );
}
