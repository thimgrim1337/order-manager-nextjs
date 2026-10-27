import { Search } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import DebouncedInput from '../../../../components/ui/debounced-input';
import useOrdersTableQuery from '../../hooks/use-orders-table-query';

export default function OrdersSearch() {
  const { query, change, reset } = useOrdersTableQuery();

  return (
    <div className="flex-1 flex gap-2 items-center">
      <DebouncedInput
        className=" border rounded-md"
        placeholder={`Szukaj zleceń....`}
        onFiltersChange={(value) => change({ search: value })}
        value={query.search ?? ''}
        icon={<Search className="text-muted-foreground" size={'1.5rem'} />}
      />
      <Button onClick={() => reset()} variant={'outline'}>
        Reset
      </Button>
    </div>
  );
}
