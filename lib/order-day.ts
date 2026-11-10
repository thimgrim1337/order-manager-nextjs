import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import {
  firstLoadingPlace,
  lastUnloadingPlace,
  type OrderPlaces,
  type PlaceReadModel,
} from '@/lib/places';
import { type Week, weekBounds, weekDays } from '@/lib/week';

type OrderDayKind = 'none' | 'loading' | 'unloading' | 'loading-unloading' | 'transit';

/** What an Order does on one day of the Week, and what the Timeline shows for it. */
export type OrderDay = {
  date: string;
  kind: OrderDayKind;
  /** On a loading day, and on a transit Monday when the Order continues from an earlier Week. */
  loadingPlace?: PlaceReadModel;
  /** On an unloading day, and on a transit Sunday when the Order continues into a later Week. */
  unloadingPlace?: PlaceReadModel;
  /** On a loading day. */
  customer?: CustomerReadModel;
  /** Monday only: the Order started in an earlier Week. */
  continuesBefore?: true;
  /** Sunday only: the Order ends in a later Week. */
  continuesAfter?: true;
};

type OrderDates = { startDate: string; endDate: string };

type OrderInWeek = OrderDates & OrderPlaces & { customer: CustomerReadModel };

/**
 * The Order's kind of day on each of the Week's seven days, Monday first, with the Places (with their
 * Countries) and Customer shown that day. An Order without Loading or Unloading
 * Places shows no place.
 */
export function orderDays(week: Week, order: OrderInWeek): OrderDay[] {
  const { monday, sunday } = weekBounds(week);
  const loadingPlace = firstLoadingPlace(order);
  const unloadingPlace = lastUnloadingPlace(order);

  return weekDays(week).map(({ date }) => {
    const kind = kindOn(date, order);
    const day: OrderDay = { date, kind };
    const loads = kind === 'loading' || kind === 'loading-unloading';
    const unloads = kind === 'unloading' || kind === 'loading-unloading';
    const transit = kind === 'transit';

    if (date === monday && order.startDate < monday) day.continuesBefore = true;
    if (date === sunday && order.endDate > sunday) day.continuesAfter = true;
    if ((loads || (transit && day.continuesBefore)) && loadingPlace)
      day.loadingPlace = loadingPlace;
    if ((unloads || (transit && day.continuesAfter)) && unloadingPlace)
      day.unloadingPlace = unloadingPlace;
    if (loads) day.customer = order.customer;
    return day;
  });
}

// yyyy-MM-dd strings sort as dates.
function kindOn(date: string, { startDate, endDate }: OrderDates): OrderDayKind {
  if (date === startDate && date === endDate) return 'loading-unloading';
  if (date === startDate) return 'loading';
  if (date === endDate) return 'unloading';
  if (date > startDate && date < endDate) return 'transit';
  return 'none';
}
