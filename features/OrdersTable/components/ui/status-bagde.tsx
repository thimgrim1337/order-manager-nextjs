import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/lib/consts";
import { Status } from "@/types/types";

export default function StatusBadge({ status }: { status: Status }) {
	const badgeColor =
		status.id === ORDER_STATUS.InProgress
			? "bg-amber-600"
			: status.id === ORDER_STATUS.Cancelled
				? "bg-red-600"
				: "bg-green-600";

	return <Badge className={badgeColor}>{status.name}</Badge>;
}
