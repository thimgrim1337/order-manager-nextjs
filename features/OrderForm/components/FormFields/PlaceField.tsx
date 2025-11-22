import { useFieldContext } from '../../context/form-context';
import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { City, Country } from '@/types/types';

export default function PlaceField({
  label,
  cities,
  countries,
  Icon,
}: {
  label: string;
  cities: City[];
  countries: Country[];
  Icon?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const field = useFieldContext<City[]>();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const selectedCities = field.state.value;

  function handleSelect(city: City) {
    const index = selectedCities.findIndex(
      (selectedCity) => selectedCity.name === city.name
    );

    if (index > -1) {
      return field.removeValue(index);
    }

    return field.pushValue(city);
  }

  return (
    <Field>
      <FieldLabel htmlFor={field.name}>
        {Icon}
        {label}
      </FieldLabel>
      <ul className='bg-neutral-100 p-2 rounded'>
        {selectedCities.map((city, i) => {
          return (
            <li
              key={i}
              className='shadow-sm rounded px-2 py-1 text-sm flex gap-2 items-center'
            >
              <span className='font-medium '>{city.name}</span>
              <span className='text-muted-foreground grow text-right mr-2 text-xs'>
                {countries[city.countryId].code} {city.postal}
              </span>
              <Button
                aria-label={`Usuń miejsce ${city.name}`}
                type='button'
                size={'icon'}
                variant={'ghost'}
                className='group'
                onClick={() => field.removeValue(i)}
              >
                <X className='transition-transform group-hover:scale-110 group-hover:text-destructive' />
              </Button>
            </li>
          );
        })}
      </ul>

      <Popover open={open} onOpenChange={setOpen} modal>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            aria-invalid={isInvalid}
            className='flex justify-between aria-invalid:border-destructive'
          >
            Wybierz miejsca
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0'>
          <Command>
            <CommandInput
              placeholder={`Szukaj ${'miejsc'}...`}
              className='h-9'
              onValueChange={() => {}}
            />
            <CommandList>
              <CommandEmpty>Nie znaleziono.</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.id}
                    value={city.name}
                    onSelect={() =>
                      handleSelect({
                        name: city.name,
                        id: city.id,
                        countryId: city.countryId,
                        postal: city.postal,
                      })
                    }
                  >
                    {city.name}
                    <Check
                      className={cn(
                        'ml-auto',
                        selectedCities.find(
                          (selectedCity) => selectedCity.name === city.name
                        )
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
