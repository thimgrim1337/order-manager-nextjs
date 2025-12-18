import { ReactNode, useState } from 'react';
import { useFieldContext } from '../../context/form-context';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Calendar } from '@/components/ui/calendar';
import { parseDate, formatDate } from '@/lib/dates';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDownIcon } from 'lucide-react';

export default function DateField({
  label,
  Icon,
}: {
  label: string;
  Icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const field = useFieldContext<string>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const selectedDate = field.state.value;

  return (
    <Field aria-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>
        {Icon}
        {label}
      </FieldLabel>

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
            selected={parseDate(selectedDate)}
            onSelect={(value) => field.handleChange(formatDate(value))}
            className='rounded-lg border shadow-sm'
            id={field.name}
          />
        </PopoverContent>
      </Popover>

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
