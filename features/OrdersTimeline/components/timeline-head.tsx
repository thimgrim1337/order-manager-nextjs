import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Day } from '@/types/types';

export default function TimelineHead({ weekdays }: { weekdays: Day[] }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-40 text-muted-foreground text">Dane pojazdu</TableHead>
        {weekdays.map((day) => (
          <TableHead key={day.date} className="min-w-25 text-center">
            <div className="flex flex-col gap-1 ">
              <span className="text-muted-foreground">{day.name}</span>
              <span className={cn(day.isWeekend && 'text-red-500')}>
                {formatDate(day.date, 'dd.MM')}
              </span>
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
