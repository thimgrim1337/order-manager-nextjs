import { Badge } from "@/components/ui/badge";
import { Status } from "@/types/types";

export default function StatusBadge({ status }: { status: Status }) {
	const badgeColor =
		status.id === 1
			? "bg-amber-600"
			: status.id === 2
				? "bg-red-600"
				: "bg-green-600";

	return <Badge className={badgeColor}>{status.name}</Badge>;
}
