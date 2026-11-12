import { ChevronDownIcon } from 'lucide-react';
import { pl } from 'react-day-picker/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { formatDate, getToday, parseDate } from '@/lib/dates';

export default function DateInput({ filterName }: { filterName: 'startDate' | 'endDate' }) {
  const { query, change } = useUrlQuery(ordersTableQuery);
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
          locale={pl}
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
