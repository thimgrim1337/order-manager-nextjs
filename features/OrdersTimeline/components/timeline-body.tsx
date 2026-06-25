import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import StatusBadge from "@/features/OrdersTable/components/ui/status-bagde";
import { cn } from "@/lib/utils";
import { Country, Day, OrderTimeline } from "@/types/types";
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
	const getCountryCode = (countryId: number) =>
		countries.find((country) => country.id === countryId)?.code;

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
					<TableCell className="flex flex-col justify-center ">
						<span className="">{order.truckPlate}</span>
						<span className="text-xs text-muted-foreground mb-1">
							{order.driverFullname}
						</span>
						<StatusBadge status={order.status} />
					</TableCell>
					{weekdays.map((day) => {
						const loadingCountryCode = getCountryCode(
							order.loadingPlaces[0].countryId,
						);
						const unloadingCountryCode = getCountryCode(
							order.unloadingPlaces[order.unloadingPlaces.length - 1].countryId,
						);
						return (
							<TableCell
								key={day.date}
								className={cn(
									day.date === order.startDate || day.date === order.endDate
										? `border-b-4 ${borderColorsMap[order.id]} relative`
										: undefined,
								)}
							>
								{day.date === order.startDate ? (
									<>
										<TimelinePlaceCell
											cityName={order.loadingCity}
											countryCode={loadingCountryCode}
										/>
										<span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
											{order.customerName}
										</span>
									</>
								) : day.date === order.endDate ? (
									<TimelinePlaceCell
										cityName={order.unloadingCity}
										countryCode={unloadingCountryCode}
									/>
								) : null}
							</TableCell>
						);
					})}
				</TableRow>
			))}
		</TableBody>
	);
}
