import { Calendar1, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFilters from "@/features/shared/hooks/useFilters";
import {
	addDays,
	getFirstDayOfWeek,
	getToday,
	getWeek,
	subDays,
} from "@/lib/dates";
import { Day } from "@/types/types";

export default function OrdersTimelinePagination({
	weekdays,
}: {
	weekdays: Day[];
}) {
	const { setFilters } = useFilters();

	const weekNumber = getWeek(weekdays[0].date);

	function handlePrevious() {
		setFilters({
			startDate: subDays(weekdays[0].date, 7),
		});
	}

	function handleForward() {
		setFilters({
			startDate: addDays(weekdays[0].date, 7),
		});
	}

	function handlePresent() {
		setFilters({ startDate: getFirstDayOfWeek(getToday()) });
	}

	return (
		<div className="flex gap-2 justify-end items-center">
			<div className="border-2 h-9 px-2.5 flex items-center rounded text-sm font-semibold mr-2">
				{weekNumber}
			</div>
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
