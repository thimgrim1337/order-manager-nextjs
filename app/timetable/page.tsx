import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import OrdersTimeline from "@/features/OrdersTimeline/components/orders-timeline";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllOrders } from "@/lib/dal/order.dal";
import { pick } from "@/lib/helpers";
import { OrderTimeline } from "@/types/types";

async function getOrders(): Promise<OrderTimeline[]> {
	const orders = await getAllOrders(0, 10, [
		{ id: "truckId", desc: false },
		{ id: "startDate", desc: false },
	]);

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

export default function OrderTablePage() {
	const orders = getOrders();
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
