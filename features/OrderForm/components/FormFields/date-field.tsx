import { useState } from 'react';
import { useFieldContext } from '../../context/form-context';
import { Calendar } from '@/components/ui/calendar';
import { parseDate, formatDate } from '@/lib/dates';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';
import FormBase, { FormControlProps } from './form-base';

export default function DateField(props: FormControlProps) {
  const [open, setOpen] = useState(false);
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const selectedDate = field.state.value;

  return (
    <FormBase {...props}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-48 justify-between font-normal'
            aria-invalid={isInvalid}
          >
            {selectedDate ? selectedDate : 'Wybierz datę'}

            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            defaultMonth={new Date(Date.now())}
            showWeekNumber
            weekStartsOn={1}
            selected={parseDate(selectedDate)}
            onSelect={(value) => field.handleChange(formatDate(value))}
            className='rounded-lg border shadow-sm'
            id={field.name}
          />
        </PopoverContent>
      </Popover>
    </FormBase>
  );
}
