import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

export default function StatusBadge({
	statusId,
	children,
}: {
	statusId: number;
	children: ReactNode;
}) {
	const badgeColor =
		statusId === 1
			? "bg-yellow-600"
			: statusId === 2
				? "bg-red-600"
				: "bg-green-600";

	return <Badge className={badgeColor}>{children}</Badge>;
}
