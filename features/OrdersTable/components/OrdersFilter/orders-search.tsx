import { Search } from 'lucide-react';
import useFilters from '@/features/shared/hooks/use-filters';
import { Button } from '../../../../components/ui/button';
import DebouncedInput from '../../../../components/ui/debounced-input';

export default function OrdersSearch() {
  const { setFilters, resetFilters, filters } = useFilters();

  return (
    <div className="flex-1 flex gap-2 items-center">
      <DebouncedInput
        className=" border rounded-md"
        placeholder={`Szukaj zleceń....`}
        onFiltersChange={(value) => setFilters({ globalFilters: value })}
        value={filters.globalFilters || ''}
        icon={<Search className="text-muted-foreground" size={'1.5rem'} />}
      />
      <Button onClick={() => resetFilters()} variant={'outline'}>
        Reset
      </Button>
    </div>
  );
}
