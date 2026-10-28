'use client';

import TimelinePaginationDriverSelect from './timeline-driver-select';
import TimelinePaginationWeekNavigation from './timeline-week-navigation';

export default function TimelinePagination() {
  return (
    <div className="flex items-center justify-between mt-2">
      <TimelinePaginationDriverSelect />
      <TimelinePaginationWeekNavigation />
    </div>
  );
}
