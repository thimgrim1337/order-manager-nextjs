import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import OrdersTimeline from "@/features/OrdersTimeline/components/timeline";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllOrders } from "@/lib/dal/order.dal";
import { getFirstDayOfWeek, getLastDayOfWeek, getToday } from "@/lib/dates";
import { pick } from "@/lib/helpers";
import { OrderFilters, OrderTimeline, SearchParams } from "@/types/types";

async function getOrders(filters?: OrderFilters): Promise<OrderTimeline[]> {
	const orders = await getAllOrders(
		0,
		10,
		[
			{ id: "truckId", desc: false },
			{ id: "startDate", desc: false },
		],
		filters,
	);

	return orders.map((order) =>
		pick(order, [
			"id",
			"startDate",
			"endDate",
			"status",
			"truckId",
			"truckPlate",
			"customerName",
			"driverId",
			"driverFullname",
			"loadingCity",
			"unloadingCity",
			"loadingPlaces",
			"unloadingPlaces",
		]),
	);
}

export default async function OrderTablePage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const validatedSearchParams = await SearchParams.parseAsync(
		await searchParams,
	);

	const startDate =
		validatedSearchParams.startDate || getFirstDayOfWeek(getToday());
	const endDate = getLastDayOfWeek(startDate);

	const orders = getOrders({
		startDate,
		endDate,
	});

	const countries = getAllCountries();

	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Harmonogram zleceń"
				subText="Tablica czasu zleceń transportowych."
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<div className="py-2 px-4 my-5">
					<OrdersTimeline orders={orders} countries={countries} />
				</div>
			</Suspense>
		</div>
	);
}
