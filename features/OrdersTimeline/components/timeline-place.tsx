import { use } from "react";
import { TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { OrderTimeline } from "@/types/types";
import { useTimelineData } from "../context/timeline-context";

export default function TimelinePlaceCell({
	order,
	date,
	borderColor,
}: {
	order: OrderTimeline;
	date: string;
	borderColor: string;
}) {
	const contextData = useTimelineData();
	const countries = use(contextData.countries);

	const getCountryCode = (countryId: number) =>
		countries.find((country) => country.id === countryId)?.code;

	const loadingCountryCode = getCountryCode(order.loadingPlaces[0].countryId);
	const unloadingCountryCode = getCountryCode(
		order.unloadingPlaces[order.unloadingPlaces.length - 1].countryId,
	);

	const isLoadingDate = date === order.startDate;
	const isUnloadingDate = date === order.endDate;

	const cityName = isLoadingDate
		? order.loadingCity
		: isUnloadingDate
			? order.unloadingCity
			: "";

	const border =
		isLoadingDate || isUnloadingDate
			? `border-b-4 ${borderColor} relative`
			: "";

	return isLoadingDate || isUnloadingDate ? (
		<TableCell className={border}>
			<div className="flex gap-2 items-center">
				<span
					className={`flag:${cn(isLoadingDate ? loadingCountryCode : isUnloadingDate ? unloadingCountryCode : undefined)}`}
				/>
				<span>{cityName}</span>
			</div>
			{isLoadingDate && (
				<span className="text-[.8rem] text-muted-foreground absolute bottom-1 max-w-75 truncate">
					{order.customerName}
				</span>
			)}
		</TableCell>
	) : (
		<TableCell />
	);
}
