import { Table } from '@/components/ui/table';
import OrderChoicesLoader from '@/features/shared/components/order-choices-loader';
import type { RawSearchParams } from '@/features/shared/lib/search-param-parsers';
import { getOrdersInWeek } from '@/lib/dal/order.dal';
import { weekDays } from '@/lib/week';
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

  return (
    <OrderChoicesLoader>
      <Table>
        <TimelineHead weekdays={weekdays} />
        <TimelineBody week={query.week} orders={orders} />
      </Table>
      <TimelinePagination />
    </OrderChoicesLoader>
  );
}
