import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import Timeline from "@/features/OrdersTimeline/components/timeline";
import { SearchParams } from "@/types/types";

export default function TimelinePage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Harmonogram zleceń"
				subText="Tablica czasu zleceń transportowych."
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<div className="py-2 px-4 my-5">
					<Timeline searchParamsPromise={searchParams} />
				</div>
			</Suspense>
		</div>
	);
}
