'use client';

import { Search } from 'lucide-react';
import DebouncedInput from './debounced-input';
import { Button } from '../ui/button';
import { useFilters } from './useFilters';

export default function OrderTableFilter() {
  const { filters, setFilters, resetFilters } = useFilters();

  return (
    <div className='flex gap-2 items-center'>
      <Search className='text-muted-foreground' />
      <DebouncedInput
        className='max-w-sm border-none'
        onChange={(value) =>
          setFilters({
            globalFilters: typeof value === 'string' ? value : value.toString(),
          })
        }
        placeholder={`Szukaj zleceń....`}
        value={filters.globalFilters || ''}
      />
      <Button onClick={() => resetFilters()} variant={'outline'}>
        Reset
      </Button>
    </div>
  );
}
