"use client";

import { use } from "react";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getToday, getWeekDays } from "@/lib/dates";
import { OrderTimeline } from "@/types/types";

export default function OrdersTimeline({
	orders,
}: {
	orders: Promise<OrderTimeline[]>;
}) {
	const weekdays = getWeekDays(getToday());
	const ordersData = use(orders);

	//zmapotać do OrderTimelineDto
	console.log("timeline", ordersData);

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{weekdays.map((day) => (
						<TableHead key={day.date}>
							<div className="flex flex-col gap-1">
								<span className="text-muted-foreground">{day.name}</span>
								<span>{day.date}</span>
							</div>
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
		</Table>
	);
}
