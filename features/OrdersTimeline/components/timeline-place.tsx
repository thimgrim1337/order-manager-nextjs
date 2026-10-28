import { TableCell } from '@/components/ui/table';
import { useOrderData } from '@/features/shared/context/order-context';
import type { OrderDay } from '@/lib/week';
import type { Order } from '@/types/types';

export default function TimelinePlaceCell({
  order,
  day,
  borderColor,
}: {
  order: Order;
  day: OrderDay;
  borderColor: string;
}) {
  const { countries } = useOrderData();

  const getCountryCode = (countryId: number) =>
    countries?.find((country) => country.id === countryId)?.code;

  const loadingPlace = order.loadingPlaces[0];
  const unloadingPlace = order.unloadingPlaces[order.unloadingPlaces.length - 1];

  if (day.role === 'none') return <TableCell />;

  const border = `border-b-4 ${borderColor} relative`;

  if (day.role === 'transit') {
    return (
      <TableCell className={border}>
        <div className="flex justify-between text-muted-foreground">
          {day.continuesBefore && <span>← {loadingPlace.name}</span>}
          {day.continuesAfter && <span className="ml-auto">{unloadingPlace.name} →</span>}
        </div>
      </TableCell>
    );
  }

  const renderPlace = (place: Order['loadingPlaces'][number]) => (
    <>
      <span className={`flag:${getCountryCode(place.countryId)}`} />
      <span>{place.name}</span>
    </>
  );

  return (
    <TableCell className={border}>
      <div className="flex gap-2 items-center">
        {day.role === 'unloading' ? (
          renderPlace(unloadingPlace)
        ) : day.role === 'loading' ? (
          renderPlace(loadingPlace)
        ) : (
          <>
            {renderPlace(loadingPlace)}
            <span>→</span>
            {renderPlace(unloadingPlace)}
          </>
        )}
      </div>
      {day.role !== 'unloading' && (
        <span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
          {order.customer.name}
        </span>
      )}
    </TableCell>
  );
}
