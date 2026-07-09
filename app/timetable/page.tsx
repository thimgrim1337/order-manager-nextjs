import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import Timeline from "@/features/OrdersTimeline/components/timeline";
import { TimelineDataProvider } from "@/features/OrdersTimeline/context/timeline-context";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllDrivers } from "@/lib/dal/driver.dal";
import { RawSearchParams } from "@/types/types";

export default function TimelinePage({
	searchParams,
}: {
	searchParams: Promise<RawSearchParams>;
}) {
	const countries = getAllCountries();
	const drivers = getAllDrivers();

	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Harmonogram zleceń"
				subText="Tablica czasu zleceń transportowych."
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<TimelineDataProvider
					dataPromise={{
						countries,
						drivers,
					}}
				>
					<div className="py-2 px-4 my-5">
						<Timeline searchParamsPromise={searchParams} />
					</div>
				</TimelineDataProvider>
			</Suspense>
		</div>
	);
}
