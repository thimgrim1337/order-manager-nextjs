import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useOrderData } from '@/features/shared/context/order-context';
import type { Driver } from '@/types/types';
import useOrdersTableQuery from '../../hooks/use-orders-table-query';

export default function DriverCombobox() {
  const { drivers } = useOrderData();
  const { query, change } = useOrdersTableQuery();

  return (
    <Combobox
      items={drivers}
      value={drivers.find((driver) => driver.id === query.driverId) ?? null}
      itemToStringLabel={(item: Driver) => `${item.firstName} ${item.lastName}`}
      itemToStringValue={(item: Driver) => String(item.id)}
      onValueChange={(value) => change({ driverId: value?.id })}
    >
      <ComboboxInput placeholder="Wybierz kierowcę" showClear />
      <ComboboxContent>
        <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
        <ComboboxList>
          {(item: Driver) => (
            <ComboboxItem key={item.id} value={item}>
              {`${item.firstName} ${item.lastName}`}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
