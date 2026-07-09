"use client";

import { Calendar1, ChevronLeft, ChevronRight } from "lucide-react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import useFilters from "@/features/shared/hooks/useFilters";
import {
	addDays,
	getFirstDayOfWeek,
	getToday,
	getWeek,
	subDays,
} from "@/lib/dates";
import { Day, Driver } from "@/types/types";

export default function TimelinePagination({
	weekdays,
	driversPromise,
}: {
	weekdays: Day[];
	driversPromise: Promise<Driver[]>;
}) {
	const drivers = use(driversPromise);

	return (
		<div className="flex items-center justify-between mt-2">
			<TimelinePaginationDriverSelect drivers={drivers} />
			<TimelinePaginationWeekNavigation weekdays={weekdays} />
		</div>
	);
}

function TimelinePaginationWeekNavigation({ weekdays }: { weekdays: Day[] }) {
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

function TimelinePaginationDriverSelect({ drivers }: { drivers: Driver[] }) {
	const { setFilters } = useFilters();

	const driversItems = drivers.map((driver) => ({
		label: `${driver.firstName} ${driver.lastName}`,
		value: driver.id,
	}));

	return (
		<Select
			items={driversItems}
			onValueChange={(value) =>
				setFilters({ driverId: value ? +value : undefined })
			}
		>
			<SelectTrigger className={"min-w-45"}>
				<SelectValue placeholder="Wszyscy kierowcy"></SelectValue>
			</SelectTrigger>
			<SelectContent alignItemWithTrigger={false}>
				<SelectGroup>
					<SelectItem value={null}>Wszyscy</SelectItem>
					{driversItems.map((driver) => (
						<SelectItem key={driver.value} value={driver.value}>
							{driver.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
