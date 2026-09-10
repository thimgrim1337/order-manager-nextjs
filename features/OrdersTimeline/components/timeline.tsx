import { RawSearchParams, TimelineFilters } from '@/types/types';
import TimelinePagination from './TimelinePagination/timeline-pagination';
import 'country-flag-icons/3x2/flags.css';
import useValidatedSearchParams from '@/features/shared/lib/use-validated-search-params';
import { getWeekDays } from '@/lib/dates';
import TimelineTable from './timeline-table';

export default function Timeline({
	searchParamsPromise,
}: {
	searchParamsPromise: Promise<RawSearchParams>;
}) {
	const {
		success,
		error,
		data: filters,
	} = useValidatedSearchParams(searchParamsPromise, TimelineFilters);

	if (!success) {
		return <p>Nieprawidłowe dane: {error.message}</p>;
	}

	const weekdays = getWeekDays(filters.startDate);

	return (
		<>
			<TimelineTable weekdays={weekdays} filters={filters} />
			<TimelinePagination weekdays={weekdays} />
		</>
	);
}
