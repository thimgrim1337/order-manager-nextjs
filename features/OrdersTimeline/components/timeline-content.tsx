import z from 'zod';
import { Table } from '@/components/ui/table';
import { OrderDataProvider } from '@/features/shared/context/order-context';
import { getAllCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllOrders } from '@/lib/dal/order.dal';
import { getAllStatuses } from '@/lib/dal/status.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import { getFirstDayOfWeek, getLastDayOfWeek, getToday, getWeekDays } from '@/lib/dates';
import { type RawSearchParams, SearchParams } from '@/types/types';
import TimelinePagination from './TimelinePagination/timeline-pagination';
import TimelineBody from './timeline-body';
import TimelineHead from './timeline-head';

type TimelineContentProps = {
  searchParamsPromise: Promise<RawSearchParams>;
};
export default async function TimelineContent({ searchParamsPromise }: TimelineContentProps) {
  const {
    data: validatedSearchParams,
    success,
    error,
  } = SearchParams.safeParse(await searchParamsPromise);

  if (!success) console.log('Błąd walidacji SearchParams: ', z.prettifyError(error));

  const startDate = validatedSearchParams?.startDate || getFirstDayOfWeek(getToday());
  const endDate = validatedSearchParams?.endDate || getLastDayOfWeek(getToday());
  const driverId = validatedSearchParams?.driverId;

  const weekdays = getWeekDays(startDate || getFirstDayOfWeek(getToday()));
  const { data: orders } = await getAllOrders(0, 100, [], {
    startDate,
    endDate,
    driverId,
  });
  const [customers, cities, drivers, trucks, countries, currencies, statuses] = await Promise.all([
    getAllCustomers(),
    getAllCities(),
    getAllDrivers(),
    getAllTrucks(),
    getAllCountries(),
    getAllCurrencies(),
    getAllStatuses(),
  ]);

  return (
    <OrderDataProvider
      data={{
        customers,
        cities,
        drivers,
        trucks,
        countries,
        currencies,
        statuses,
      }}
    >
      <Table>
        <TimelineHead weekdays={weekdays} />
        <TimelineBody orders={orders} />
      </Table>
      <TimelinePagination weekdays={weekdays} />
    </OrderDataProvider>
  );
}
