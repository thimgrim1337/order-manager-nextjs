import { TableCell } from "@/components/ui/table";
import StatusBadge from "@/features/OrdersTable/components/ui/status-bagde";
import { OrderTimeline } from "@/types/types";

export default function TimelineDetailsCell({
	order,
}: {
	order: OrderTimeline;
}) {
	return (
		<TableCell className="flex flex-col justify-center ">
			<span className="">{order.truckPlate}</span>
			<span className="text-xs text-muted-foreground mb-1">
				{order.driverFullname}
			</span>
			<StatusBadge status={order.status} />
		</TableCell>
	);
}
