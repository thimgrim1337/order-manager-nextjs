import { Table } from '@/components/ui/table';
import { OrderDataProvider } from '@/features/shared/context/order-context';
import { getAllCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getOrdersInWeek } from '@/lib/dal/order.dal';
import { getAllStatuses } from '@/lib/dal/status.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import { weekDays } from '@/lib/week';
import type { RawSearchParams } from '@/types/types';
import { parse } from '../lib/timeline-query';
import TimelinePagination from './TimelinePagination/timeline-pagination';
import TimelineBody from './timeline-body';
import TimelineHead from './timeline-head';

type TimelineContentProps = {
  searchParamsPromise: Promise<RawSearchParams>;
};
export default async function TimelineContent({ searchParamsPromise }: TimelineContentProps) {
  const query = parse(await searchParamsPromise);

  const weekdays = weekDays(query.week);
  const orders = await getOrdersInWeek(query.week, { driverId: query.driverId });
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
      <TimelinePagination />
    </OrderDataProvider>
  );
}
