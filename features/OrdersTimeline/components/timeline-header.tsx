import { formatDate } from "date-fns";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Day } from "@/types/types";

export default function OrderTimelineHeader({ weekdays }: { weekdays: Day[] }) {
	return (
		<TableHeader>
			<TableRow>
				<TableHead className="w-25 " />
				{weekdays.map((day, index) => (
					<TableHead key={day.date} className="min-w-25 w-40 text-center">
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
	);
}
