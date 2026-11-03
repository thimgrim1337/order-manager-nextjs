import { TableCell } from '@/components/ui/table';
import { useOrderData } from '@/features/shared/context/order-context';
import type { OrderDay } from '@/lib/week';
import type { City } from '@/types/types';

export default function TimelinePlaceCell({
  day,
  borderColor,
}: {
  day: OrderDay;
  borderColor: string;
}) {
  const { countries } = useOrderData();

  const getCountryCode = (countryId: number) =>
    countries?.find((country) => country.id === countryId)?.code;

  if (day.role === 'none') return <TableCell />;

  const border = `border-b-4 ${borderColor} relative`;

  if (day.role === 'transit') {
    return (
      <TableCell className={border}>
        <div className="flex justify-between text-muted-foreground">
          {day.loadingPlace && <span>← {day.loadingPlace.name}</span>}
          {day.unloadingPlace && <span className="ml-auto">{day.unloadingPlace.name} →</span>}
        </div>
      </TableCell>
    );
  }

  const renderPlace = (place?: City) =>
    place && (
      <>
        <span className={`flag:${getCountryCode(place.countryId)}`} />
        <span>{place.name}</span>
      </>
    );

  return (
    <TableCell className={border}>
      <div className="flex gap-2 items-center">
        {renderPlace(day.loadingPlace)}
        {day.role === 'loading-unloading' && <span>→</span>}
        {renderPlace(day.unloadingPlace)}
      </div>
      {day.customer && (
        <span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
          {day.customer.name}
        </span>
      )}
    </TableCell>
  );
}
