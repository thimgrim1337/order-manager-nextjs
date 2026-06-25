"use client";

import { use } from "react";
import { Table } from "@/components/ui/table";
import { getToday, getWeekDays } from "@/lib/dates";

import { Country, OrderTimeline } from "@/types/types";
import "country-flag-icons/3x2/flags.css";

import OrdersTimelineBody from "./timeline-body";
import OrderTimelineHeader from "./timeline-header";

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

	return (
		<Table>
			<OrderTimelineHeader weekdays={weekdays} />
			<OrdersTimelineBody
				weekdays={weekdays}
				orders={ordersData}
				countries={countriesData}
			/>
		</Table>
	);
}
