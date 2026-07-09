"use client";

import { TableRow } from "@/components/ui/table";
import useFilters from "@/features/shared/hooks/use-filters";
import { getWeekDays } from "@/lib/dates";
import { OrderTimeline } from "@/types/types";
import TimelineDetailsCell from "./timeline-details";
import TimelinePlaceCell from "./timeline-place";

export default function TimelineOrder({
	order,
	borderColor,
}: {
	order: OrderTimeline;
	borderColor: string;
}) {
	const { filters } = useFilters();
	const weekdays = getWeekDays(filters.startDate);

	return (
		<TableRow key={order.id} onClick={() => console.log("work")}>
			<TimelineDetailsCell key={order.id} order={order} />
			{weekdays.map((day) => (
				<TimelinePlaceCell
					key={day.date}
					order={order}
					date={day.date}
					borderColor={borderColor}
				/>
			))}
		</TableRow>
	);
}
