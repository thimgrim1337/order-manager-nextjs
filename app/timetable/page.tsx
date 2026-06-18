import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import OrdersTimeline from "@/features/OrdersTimeline/components/orders-timeline";
import { getAllOrders } from "@/lib/dal/order.dal";
import { pick } from "@/lib/helpers";
import { OrderTimeline } from "@/types/types";

async function getOrders(): Promise<OrderTimeline[]> {
	const orders = await getAllOrders(0, 10, undefined);

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
		]),
	);
}

export default function OrderTablePage() {
	const orders = getOrders();

	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Harmonogram zleceń"
				subText="Tablica czasu zleceń transportowych."
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<div className="py-2 px-4 my-5">
					<OrdersTimeline orders={orders} />
				</div>
			</Suspense>
		</div>
	);
}
