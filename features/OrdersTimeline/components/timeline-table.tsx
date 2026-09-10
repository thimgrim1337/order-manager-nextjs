import { Table } from '@/components/ui/table';
import { Day, TimelineFilters } from '@/types/types';
import TimelineBody from './timeline-body';
import TimelineHead from './timeline-head';

export default function TimelineTable({
	weekdays,
	filters,
}: {
	weekdays: Day[];
	filters: TimelineFilters;
}) {
	return (
		<Table>
			<TimelineHead weekdays={weekdays} />
			<TimelineBody filters={filters} />
		</Table>
	);
}
