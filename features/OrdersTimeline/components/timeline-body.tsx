import { TableBody, TableRow } from "@/components/ui/table";
import { Country, Day, OrderTimeline } from "@/types/types";
import TimelineDetailsCell from "./timeline-details";
import TimelinePlaceCell from "./timeline-place";

const borderColors = [
	"border-chart-1",
	"border-chart-2",
	"border-chart-3",
	"border-chart-4",
	"border-chart-5",
];

export default function OrdersTimelineBody({
	weekdays,
	orders,
	countries,
}: {
	weekdays: Day[];
	orders: OrderTimeline[];
	countries: Country[];
}) {
	const borderColorsMap = orders.reduce(
		(acc, order, index) => {
			const color = borderColors[index];
			acc[order.id] = color;
			return acc;
		},
		{} as Record<string, string>,
	);

	return (
		<TableBody>
			{orders.map((order) => (
				<TableRow key={order.id}>
					<TimelineDetailsCell key={order.id} order={order} />
					{weekdays.map((day) => (
						<TimelinePlaceCell
							key={day.date}
							order={order}
							countries={countries}
							date={day.date}
							borderColor={borderColorsMap[order.id]}
						/>
					))}
				</TableRow>
			))}
		</TableBody>
	);
}
