"use client";

import { use } from "react";
import { Table } from "@/components/ui/table";
import { getToday, getWeekDays } from "@/lib/dates";

import { Country, OrderTimeline } from "@/types/types";
import "country-flag-icons/3x2/flags.css";

import useFilters from "@/features/shared/hooks/useFilters";
import OrdersTimelineBody from "./timeline-body";
import OrdersTimelineHeader from "./timeline-header";
import OrdersTimelinePagination from "./timeline-pagination";

export default function OrdersTimeline({
	orders,
	countries,
}: {
	orders: Promise<OrderTimeline[]>;
	countries: Promise<Country[]>;
}) {
	const { filters } = useFilters();

	const weekdays = getWeekDays(filters.startDate || getToday());

	const ordersData = use(orders);
	const countriesData = use(countries);

	return (
		<>
			<Table>
				<OrdersTimelineHeader weekdays={weekdays} />
				<OrdersTimelineBody
					weekdays={weekdays}
					orders={ordersData}
					countries={countriesData}
				/>
			</Table>
			<OrdersTimelinePagination weekdays={weekdays} />
		</>
	);
}
