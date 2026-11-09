import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { TableCell } from '@/components/ui/table';
import type { OrderDay, ShownCity } from '@/lib/order-day';
import { cn } from '@/lib/utils';

export default function TimelinePlaceCell({
  day,
  borderColor,
}: {
  day: OrderDay;
  borderColor: string;
}) {
  if (day.kind === 'none') return <TableCell />;

  const border = cn(
    'border-b-4 relative',
    borderColor,
    day.continuesBefore && 'pl-5',
    day.continuesAfter && 'pr-5',
  );

  if (day.kind === 'transit') {
    return (
      <TableCell className={border}>
        <ContinuingMarks day={day} />
        <div className="flex justify-between text-muted-foreground">
          {day.loadingPlace && <span>{day.loadingPlace.name}</span>}
          {day.unloadingPlace && <span className="ml-auto">{day.unloadingPlace.name}</span>}
        </div>
      </TableCell>
    );
  }

  return (
    <TableCell className={border}>
      <ContinuingMarks day={day} />
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

/** Shows that the Order runs on beyond the Week: at Monday's left edge, at Sunday's right edge. */
function ContinuingMarks({ day }: { day: OrderDay }) {
  return (
    <>
      {day.continuesBefore && (
        <ContinuingMark label="Ciąg dalszy z poprzedniego tygodnia" className="left-0.5">
          <ChevronsLeft aria-hidden className="size-4" />
        </ContinuingMark>
      )}
      {day.continuesAfter && (
        <ContinuingMark label="Ciąg dalszy w następnym tygodniu" className="right-0.5">
          <ChevronsRight aria-hidden className="size-4" />
        </ContinuingMark>
      )}
    </>
  );
}

function ContinuingMark({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn('absolute top-1/2 -translate-y-1/2 text-muted-foreground', className)}
    >
      {children}
    </span>
  );
}
