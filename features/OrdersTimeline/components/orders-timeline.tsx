import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getToday, getWeekDays } from "@/lib/dates";

export default function OrdersTimeline() {
	const weekdays = getWeekDays(getToday());

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
