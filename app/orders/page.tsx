import { Suspense } from 'react';
import PageHeader from '@/components/ui/page-header';
import OrdersContent from '@/features/OrdersTable/components/orders-content';
import type { RawSearchParams } from '@/types/types';

export default function OrdersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <div className="w-[90%] m-auto my-5">
      <PageHeader title="Zlecenia" subText="System zarządzania zleceniami transportowymi." />
      <Suspense fallback={<p>Loading...</p>}>
        <OrdersContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
