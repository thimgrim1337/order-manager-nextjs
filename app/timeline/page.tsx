import { Suspense } from 'react';
import PageHeader from '@/components/ui/page-header';
import TimelineContent from '@/features/OrdersTimeline/components/timeline-content';
import type { RawSearchParams } from '@/types/types';

export default function TimelinePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <div className="w-[90%] m-auto my-5 px-5">
      <PageHeader title="Harmonogram zleceń" subText="Tablica czasu zleceń transportowych." />

      <Suspense fallback={<p>Loading...</p>}>
        <TimelineContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
