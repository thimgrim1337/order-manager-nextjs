import PageHeader from "@/components/ui/page-header";
import OrdersTimeline from "@/features/OrdersTimeline/components/orders-timeline";

export default function OrderTablePage() {
	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Harmonogram zleceń"
				subText="Tablica czasu zleceń transportowych."
			/>

			<div className="border rounded-md py-2 px-4 my-5">
				<OrdersTimeline />
			</div>
		</div>
	);
}
