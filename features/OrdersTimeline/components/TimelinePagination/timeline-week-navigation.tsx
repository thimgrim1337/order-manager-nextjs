import { Calendar1, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFilters from "@/features/shared/hooks/use-filters";
import {
	addDays,
	getFirstDayOfWeek,
	getLastDayOfWeek,
	getToday,
	getWeek,
	subDays,
} from "@/lib/dates";
import { Day } from "@/types/types";
import TimelinePaginationWeekSelect from "./timeline-week-select";

export default function TimelinePaginationWeekNavigation({
	weekdays,
}: {
	weekdays: Day[];
}) {
	const { setFilters } = useFilters();
	const firstDayOfWeek = weekdays[0].date;
	const lastDayOfWeek = weekdays[6].date;
	const selectedWeekNumber = getWeek(firstDayOfWeek);

	function handlePrevious() {
		setFilters({
			startDate: subDays(firstDayOfWeek, 7),
			endDate: subDays(lastDayOfWeek, 7),
		});
	}

	function handleForward() {
		setFilters({
			startDate: addDays(firstDayOfWeek, 7),
			endDate: addDays(lastDayOfWeek, 7),
		});
	}

	function handlePresent() {
		setFilters({
			startDate: getFirstDayOfWeek(getToday()),
			endDate: getLastDayOfWeek(getToday()),
		});
	}

	return (
		<div className="flex gap-2 justify-end items-center">
			<TimelinePaginationWeekSelect selectedWeekNumber={selectedWeekNumber} />
			<Button variant={"outline"} onClick={handlePrevious}>
				<ChevronLeft />
			</Button>
			<Button variant={"outline"} onClick={handlePresent}>
				<Calendar1 />
			</Button>
			<Button variant={"outline"} onClick={handleForward}>
				<ChevronRight />
			</Button>
		</div>
	);
}
