import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getAllOrders } from "@/lib/dal/order.dal";
import { getFirstDayOfWeek, getLastDayOfWeek, getToday } from "@/lib/dates";
import { pick } from "@/lib/helpers";
import { OrderTimeline, TimetableFilters } from "@/types/types";
import TimelineOrder from "./timeline-order";

const borderColors = [
	"border-chart-1",
	"border-chart-2",
	"border-chart-3",
	"border-chart-4",
	"border-chart-5",
];

async function getOrders(filters?: TimetableFilters): Promise<OrderTimeline[]> {
	const orders = await getAllOrders(
		0,
		10,
		[
			{ id: "truckId", desc: false },
			{ id: "startDate", desc: false },
		],
		filters,
	);

	return orders.map((order) =>
		pick(order, [
			"id",
			"startDate",
			"endDate",
			"status",
			"truckId",
			"truckPlate",
			"customerName",
			"driverId",
			"driverFullname",
			"loadingCity",
			"unloadingCity",
			"loadingPlaces",
			"unloadingPlaces",
		]),
	);
}

export default async function TimelineBody({
	filters,
}: {
	filters?: TimetableFilters;
}) {
	const orders = await getOrders({
		startDate: getFirstDayOfWeek(filters?.startDate ?? getToday()),
		endDate: getLastDayOfWeek(filters?.startDate ?? getToday()),
		driverId: filters?.driverId,
	});

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
			{orders.length ? (
				orders.map((order) => (
					<TimelineOrder
						key={order.id}
						order={order}
						borderColor={borderColorsMap[order.id]}
					/>
				))
			) : (
				<TableRow>
					<TableCell colSpan={100} className="text-center font-semibold py-4 ">
						Brak zleceń
					</TableCell>
				</TableRow>
			)}
		</TableBody>
	);
}
