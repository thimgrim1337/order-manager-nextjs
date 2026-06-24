"use client";

import { use } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate, getToday, getWeekDays } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Country, OrderTimeline } from "@/types/types";
import "country-flag-icons/3x2/flags.css";
import StatusBadge from "@/features/OrdersTable/components/ui/status-bagde";

export default function OrdersTimeline({
	orders,
	countries,
}: {
	orders: Promise<OrderTimeline[]>;
	countries: Promise<Country[]>;
}) {
	const weekdays = getWeekDays(getToday());
	const ordersData = use(orders);
	const countriesData = use(countries);

	const getCountryCode = (countryId: number) =>
		countriesData.find((country) => country.id === countryId)?.code;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className="w-25" />
					{weekdays.map((day, index) => (
						<TableHead key={day.date} className="min-w-25 w-40">
							<div className="flex flex-col gap-1 ">
								<span className="text-muted-foreground">{day.name}</span>
								<span
									className={cn(
										index === 5 || index === 6 ? "text-red-500" : undefined,
									)}
								>
									{formatDate(day.date, "dd.MM")}
								</span>
							</div>
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{ordersData.map((order) => (
					<TableRow key={order.id}>
						<TableCell className="flex flex-col gap-1 ">
							<span className="">{order.truckPlate}</span>
							<span className="text-xs text-muted-foreground">
								{order.driverFullname}
							</span>
							<StatusBadge status={order.status} />
						</TableCell>
						{weekdays.map((day) => {
							const loadingCountryCode = getCountryCode(
								order.loadingPlaces[0].countryId,
							);
							const unloadingCountryCode = getCountryCode(
								order.unloadingPlaces[order.unloadingPlaces.length - 1]
									.countryId,
							);
							return (
								<TableCell
									key={day.date}
									className={cn(
										day.date === order.startDate || day.date === order.endDate
											? "border-b-5 border-b-orange-800"
											: undefined,
									)}
								>
									{day.date === order.startDate ? (
										<div className="flex gap-2 items-center">
											<span className={`flag:${loadingCountryCode}`} />
											<span>{order.loadingCity}</span>
										</div>
									) : day.date === order.endDate ? (
										<div className="flex gap-2 items-center">
											<span className={`flag:${unloadingCountryCode}`} />
											<span>{order.unloadingCity}</span>
										</div>
									) : null}
								</TableCell>
							);
						})}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
