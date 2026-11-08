import { TableCell } from '@/components/ui/table';
import type { OrderDay, ShownCity } from '@/lib/order-day';

export default function TimelinePlaceCell({
  day,
  borderColor,
}: {
  day: OrderDay;
  borderColor: string;
}) {
  if (day.kind === 'none') return <TableCell />;

  const border = `border-b-4 ${borderColor} relative`;

  if (day.kind === 'transit') {
    return (
      <TableCell className={border}>
        <div className="flex justify-between text-muted-foreground">
          {day.loadingPlace && <span>← {day.loadingPlace.name}</span>}
          {day.unloadingPlace && <span className="ml-auto">{day.unloadingPlace.name} →</span>}
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell className={border}>
      <div className="flex gap-2 items-center">
        <CityWithFlag city={day.loadingPlace} />
        {day.kind === 'loading-unloading' && <span>→</span>}
        <CityWithFlag city={day.unloadingPlace} />
      </div>
      {day.customer && (
        <span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
          {day.customer.name}
        </span>
      )}
    </TableCell>
  );
}

function CityWithFlag({ city }: { city?: ShownCity }) {
  if (!city) return null;

  return (
    <>
      {city.country && (
        <span role="img" aria-label={city.country.code} className={`flag:${city.country.code}`} />
      )}
      <span>{city.name}</span>
    </>
  );
}
