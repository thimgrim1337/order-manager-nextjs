'use client';

import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Updater } from '@tanstack/react-form';
import { HTMLAttributes, useEffect, useState } from 'react';
import useDebouce from '@/features/OrderForm/hooks/useDebouce';
import { ComboboxData } from '@/types/types';

type ComboboxProps = {
  data: ComboboxData[];
  placeholder: string;
  onChange: (updater: Updater<number>) => void;
  value: number;
  onSearch?: (value: string) => void;
} & Omit<HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue'>;

export function Combobox({
  data,
  placeholder,
  onChange,
  value,
  onSearch,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debounced = useDebouce(search, 300);

  useEffect(() => {
    if (onSearch) onSearch(debounced);
  }, [debounced]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={props.id}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          aria-invalid={props['aria-invalid']}
          className='flex justify-between aria-invalid:border-destructive'
        >
          <span className='overflow-hidden'>
            {value ? data.find((d) => d.id === value)?.value : `${placeholder}`}
          </span>

          <ChevronsUpDown className='opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='p-0'>
        <Command>
          <CommandInput
            placeholder={`Szukaj ${placeholder.split(' ')[1]}...`}
            className='h-9'
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>Nie znaleziono.</CommandEmpty>
            <CommandGroup>
              {data.map((d) => (
                <CommandItem
                  key={d.id}
                  value={d.value.toString()}
                  onSelect={() => {
                    onChange(d.id);
                    setOpen(false);
                  }}
                >
                  {d.value}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === d.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
