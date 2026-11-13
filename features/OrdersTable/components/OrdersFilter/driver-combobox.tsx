import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import * as ordersTableQuery from '@/features/OrdersTable/lib/orders-table-query';
import { useOrderChoices } from '@/features/shared/context/order-choices-context';
import useUrlQuery from '@/features/shared/hooks/use-url-query';
import type { DriverReadModel } from '@/lib/dal/driver.dal';
import { driverName } from '@/lib/drivers';

export default function DriverCombobox({ id }: { id: string }) {
  const { drivers } = useOrderChoices();
  const { query, change } = useUrlQuery(ordersTableQuery);

  return (
    <Combobox
      items={drivers}
      value={drivers.find((driver) => driver.id === query.driverId) ?? null}
      itemToStringLabel={driverName}
      itemToStringValue={(item: DriverReadModel) => String(item.id)}
      onValueChange={(value) => change({ driverId: value?.id })}
    >
      <ComboboxInput id={id} placeholder="Wybierz kierowcę" showClear />
      <ComboboxContent>
        <ComboboxEmpty>Nic nie znaleziono.</ComboboxEmpty>
        <ComboboxList>
          {(item: DriverReadModel) => (
            <ComboboxItem key={item.id} value={item}>
              {driverName(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
