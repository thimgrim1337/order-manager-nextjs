import { Table } from "@/components/ui/table";
import { RawSearchParams, TimetableFilters } from "@/types/types";
import TimelineBody from "./timeline-body";
import TimelineHead from "./timeline-head";
import TimelinePagination from "./timeline-pagination";
import "country-flag-icons/3x2/flags.css";
import useValidatedSearchParams from "@/features/shared/lib/use-validated-search-params";
import { getFirstDayOfWeek, getToday, getWeekDays } from "@/lib/dates";

export default function Timeline({
	searchParamsPromise,
}: {
	searchParamsPromise: Promise<RawSearchParams>;
}) {
	const {
		success,
		error,
		data: searchParams,
	} = useValidatedSearchParams(searchParamsPromise, TimetableFilters);

	if (!success) {
		return <p>Nieprawidłowe dane: {error.message}</p>;
	}

	const startDate = searchParams?.startDate || getFirstDayOfWeek(getToday());
	const weekdays = getWeekDays(startDate);

	return (
		<>
			<Table>
				<TimelineHead weekdays={weekdays} />
				<TimelineBody filters={searchParams} />
			</Table>
			<TimelinePagination weekdays={weekdays} />
		</>
	);
}
