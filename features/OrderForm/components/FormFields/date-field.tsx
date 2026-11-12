import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';
import { pl } from 'react-day-picker/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate, getToday, parseDate } from '@/lib/dates';
import { useFieldContext } from '../../context/form-context';
import FormBase, { type FormControlProps } from './form-base';

export default function DateField({ label, icon, error }: FormControlProps) {
  const [open, setOpen] = useState(false);
  const field = useFieldContext<string>();
  const value = field.state.value;
  const selectedDay = value ? parseDate(value) : undefined;

  return (
    <FormBase label={label} icon={icon} error={error}>
      {({ id, isInvalid }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id={id}
                className="w-48 justify-between font-normal"
                aria-invalid={isInvalid}
              >
                {value ? value : 'Wybierz datę'}

                <ChevronDownIcon />
              </Button>
            }
          ></PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              locale={pl}
              // An Order needs both dates: clicking the picked day keeps it rather than clearing it.
              required
              defaultMonth={selectedDay ?? parseDate(getToday())}
              showWeekNumber
              weekStartsOn={1}
              selected={selectedDay}
              onSelect={(value) => {
                field.handleChange(formatDate(value));
                setOpen(false);
              }}
              className="rounded-lg border shadow-sm"
            />
          </PopoverContent>
        </Popover>
      )}
    </FormBase>
  );
}
