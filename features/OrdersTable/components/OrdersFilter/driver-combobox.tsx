import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import { useOrderData } from '@/features/shared/context/order-context';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import { driverName } from '@/lib/drivers';
import type { Driver } from '@/types/types';

export default function DriverCombobox() {
  const { drivers } = useOrderData();
  const { query, change } = useUrlQuery(ordersTableQuery);

  return (
    <Combobox
      items={drivers}
      value={drivers.find((driver) => driver.id === query.driverId) ?? null}
      itemToStringLabel={driverName}
      itemToStringValue={(item: Driver) => String(item.id)}
      onValueChange={(value) => change({ driverId: value?.id })}
    >
      <ComboboxInput placeholder="Wybierz kierowcę" showClear />
      <ComboboxContent>
        <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
        <ComboboxList>
          {(item: Driver) => (
            <ComboboxItem key={item.id} value={item}>
              {driverName(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
