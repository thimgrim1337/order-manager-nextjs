import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllOrders } from "@/lib/dal/order.dal";
import { getFirstDayOfWeek, getLastDayOfWeek, getToday } from "@/lib/dates";
import { pick } from "@/lib/helpers";
import { Day, OrderFilters, OrderTimeline } from "@/types/types";
import TimelineDetailsCell from "./timeline-details";
import TimelinePlaceCell from "./timeline-place";

const borderColors = [
	"border-chart-1",
	"border-chart-2",
	"border-chart-3",
	"border-chart-4",
	"border-chart-5",
];

async function getOrders(filters?: OrderFilters): Promise<OrderTimeline[]> {
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
	weekdays,
	filters,
}: {
	weekdays: Day[];
	filters?: OrderFilters;
}) {
	const orders = await getOrders({
		startDate: filters?.startDate || getFirstDayOfWeek(getToday()),
		endDate: getLastDayOfWeek(filters?.startDate || getToday()),
		driverId: filters?.driverId,
	});
	const countries = await getAllCountries();

	const borderColorsMap = orders.reduce(
		(acc, order, index) => {
			const color = borderColors[index];
			acc[order.id] = color;
			return acc;
		},
		{} as Record<string, string>,
	);

	return (
		<>
			<TableBody>
				{orders.length ? (
					orders.map((order) => (
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
					))
				) : (
					<TableRow>
						<TableCell
							colSpan={100}
							className="text-center font-semibold py-4 "
						>
							Brak zleceń
						</TableCell>
					</TableRow>
				)}
			</TableBody>
		</>
	);
}
