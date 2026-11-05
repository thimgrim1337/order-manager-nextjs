import { Search } from 'lucide-react';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { Button } from '../../../../components/ui/button';
import DebouncedInput from '../../../../components/ui/debounced-input';

export default function OrdersSearch() {
  const { query, change, update } = useUrlQuery(ordersTableQuery);

  return (
    <div className="flex-1 flex gap-2 items-center">
      <DebouncedInput
        className=" border rounded-md"
        placeholder={`Szukaj zleceń....`}
        onDebouncedChange={(value) => change({ search: value })}
        value={query.search ?? ''}
        icon={<Search className="text-muted-foreground" size={'1.5rem'} />}
      />
      <Button onClick={() => update(ordersTableQuery.reset)} variant={'outline'}>
        Reset
      </Button>
    </div>
  );
}
