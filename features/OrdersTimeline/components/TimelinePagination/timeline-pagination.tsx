'use client';

import type { Day } from '@/types/types';
import TimelinePaginationDriverSelect from './timeline-driver-select';
import TimelinePaginationWeekNavigation from './timeline-week-navigation';

export default function TimelinePagination({ weekdays }: { weekdays: Day[] }) {
  return (
    <div className="flex items-center justify-between mt-2">
      <TimelinePaginationDriverSelect />
      <TimelinePaginationWeekNavigation weekdays={weekdays} />
    </div>
  );
}
