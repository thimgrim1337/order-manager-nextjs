import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { useOrderData } from '@/features/shared/context/order-context';
import useFilters from '@/features/shared/hooks/use-filters';
import type { Driver } from '@/types/types';

export default function DriverCombobox() {
  const { drivers } = useOrderData();
  const { setFilters } = useFilters();

  return (
    <Combobox
      items={drivers}
      itemToStringLabel={(item: Driver) => `${item.firstName} ${item.lastName}`}
      itemToStringValue={(item: Driver) => String(item.id)}
      onValueChange={(value) =>
        setFilters({
          driverId: value?.id,
        })
      }
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
