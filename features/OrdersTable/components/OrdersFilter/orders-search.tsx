import { Search } from 'lucide-react';
import { useState } from 'react';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { parseText } from '@/features/shared/lib/search-param-parsers';
import { Button } from '../../../../components/ui/button';
import DebouncedInput from '../../../../components/ui/debounced-input';

export default function OrdersSearch() {
  const { query, change, update } = useUrlQuery(ordersTableQuery);
  // Bumped by Reset, so the input starts over: a term it still holds back is dropped.
  const [resets, setResets] = useState(0);

  function reset() {
    setResets((count) => count + 1);
    update(ordersTableQuery.reset);
  }

  return (
    <div className="flex-1 flex gap-2 items-center">
      <DebouncedInput
        key={resets}
        className=" border rounded-md"
        placeholder={`Szukaj zleceń....`}
        onDebouncedChange={(value) => change({ search: value })}
        normalize={(value) => parseText(value) ?? ''}
        value={query.search ?? ''}
        icon={<Search className="text-muted-foreground" size={'1.5rem'} />}
      />
      <Button onClick={reset} variant={'outline'}>
        Reset
      </Button>
    </div>
  );
}
