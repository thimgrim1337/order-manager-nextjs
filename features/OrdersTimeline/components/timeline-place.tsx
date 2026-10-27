import { TableCell } from '@/components/ui/table';
import { useOrderData } from '@/features/shared/context/order-context';
import { compareAsc } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/types';

export default function TimelinePlaceCell({
  order,
  date,
  borderColor,
}: {
  order: Order;
  date: string;
  borderColor: string;
}) {
  const { countries } = useOrderData();

  const getCountryCode = (countryId: number) =>
    countries?.find((country) => country.id === countryId)?.code;

  const loadingCountryCode = getCountryCode(order.loadingPlaces[0].countryId);
  const unloadingCountryCode = getCountryCode(
    order.unloadingPlaces[order.unloadingPlaces.length - 1].countryId,
  );
  const loadingCity = order.loadingPlaces[0].name;
  const unloadingCity = order.unloadingPlaces[order.unloadingPlaces.length - 1].name;

  const isLoadingDate = date === order.startDate;
  const isUnloadingDate = date === order.endDate;
  const isBeetween =
    compareAsc(date, order.startDate) === 1 && compareAsc(date, order.endDate) === -1;

  const cityName = isLoadingDate ? loadingCity : isUnloadingDate ? unloadingCity : '';

  const border =
    isLoadingDate || isUnloadingDate || isBeetween ? `border-b-4 ${borderColor} relative` : '';

  return isLoadingDate || isUnloadingDate ? (
    <TableCell className={border}>
      <div className="flex gap-2 items-center">
        <span
          className={`flag:${cn(isLoadingDate ? loadingCountryCode : isUnloadingDate ? unloadingCountryCode : undefined)}`}
        />
        <span>{cityName}</span>
      </div>
      {isLoadingDate && (
        <span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
          {order.customer.name}
        </span>
      )}
    </TableCell>
  ) : (
    <TableCell className={border} />
  );
}
