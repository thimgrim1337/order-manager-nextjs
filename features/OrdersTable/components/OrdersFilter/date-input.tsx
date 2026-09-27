import { ChevronDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useFilters from '@/features/shared/hooks/use-filters';
import { formatDate, parseDate } from '@/lib/dates';

export default function DateInput({ filterName }: { filterName: 'startDate' | 'endDate' }) {
  const { setFilters, filters } = useFilters();
  const [selectedDate, setSelectedDate] = useState<string | undefined>(filters[filterName]);

  useEffect(() => {
    setSelectedDate(filters[filterName]);
  }, [filterName, filters]);

  function handleDateChange(date: string) {
    setSelectedDate(date);
    setFilters({
      [filterName]: date,
    });
  }

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
          defaultMonth={new Date(Date.now())}
          showWeekNumber
          weekStartsOn={1}
          selected={selectedDate ? parseDate(selectedDate) : undefined}
          onSelect={(value) => handleDateChange(formatDate(value))}
          className="rounded-lg border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
