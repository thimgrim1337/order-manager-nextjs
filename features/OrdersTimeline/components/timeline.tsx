import { Table } from "@/components/ui/table";
import { SearchParams } from "@/types/types";
import TimelineBody from "./timeline-body";
import TimelineHead from "./timeline-head";
import TimelinePagination from "./timeline-pagination";
import "country-flag-icons/3x2/flags.css";

import { getAllDrivers } from "@/lib/dal/driver.dal";
import { getFirstDayOfWeek, getToday, getWeekDays } from "@/lib/dates";

export default async function Timeline({
	searchParamsPromise,
}: {
	searchParamsPromise?: Promise<SearchParams>;
}) {
	const rawSearchParams = await searchParamsPromise;
	const {
		success,
		data: searchParams,
		error,
	} = SearchParams.safeParse(rawSearchParams);

	if (!success) {
		return <p>Nieprawidłowe dane: {error.message}</p>;
	}

	const startDate = searchParams?.startDate || getFirstDayOfWeek(getToday());
	const weekdays = getWeekDays(startDate);
	const drivers = getAllDrivers();

	return (
		<>
			<Table>
				<TimelineHead weekdays={weekdays} />
				<TimelineBody weekdays={weekdays} filters={searchParams} />
			</Table>
			<TimelinePagination weekdays={weekdays} driversPromise={drivers} />
		</>
	);
}
