import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate, getToday, parseDate } from '@/lib/dates';
import useOrdersTableQuery from '../../hooks/use-orders-table-query';

export default function DateInput({ filterName }: { filterName: 'startDate' | 'endDate' }) {
  const { query, change } = useOrdersTableQuery();
  const selectedDate = query[filterName];

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="w-48 justify-between font-normal">
            {selectedDate ? (
              selectedDate
            ) : (
              <span className="text-muted-foreground">Wybierz datę</span>
            )}

            <ChevronDownIcon />
          </Button>
        }
      ></PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          defaultMonth={parseDate(selectedDate || getToday())}
          showWeekNumber
          weekStartsOn={1}
          selected={selectedDate ? parseDate(selectedDate) : undefined}
          onSelect={(value) => change({ [filterName]: formatDate(value) || undefined })}
          className="rounded-lg border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
