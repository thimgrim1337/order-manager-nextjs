import { Suspense } from 'react';
import PageHeader from '@/components/ui/page-header';
import Timeline from '@/features/OrdersTimeline/components/timeline';
import { OrderDataProvider } from '@/features/shared/context/order-context';
import { getAllCities } from '@/lib/dal/city.dal';
import { getAllCountries } from '@/lib/dal/country.dal';
import { getAllCurrencies } from '@/lib/dal/currency.dal';
import { getAllCustomers } from '@/lib/dal/customer.dal.';
import { getAllDrivers } from '@/lib/dal/driver.dal';
import { getAllTrucks } from '@/lib/dal/truck.dal';
import type { RawSearchParams } from '@/types/types';

export default function TimelinePage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const customers = getAllCustomers();
  const currencies = getAllCurrencies();
  const trucks = getAllTrucks();
  const cities = getAllCities();
  const countries = getAllCountries();
  const drivers = getAllDrivers();

  return (
    <div className="w-[90%] m-auto my-5 px-5">
      <PageHeader title="Harmonogram zleceń" subText="Tablica czasu zleceń transportowych." />

      <Suspense fallback={<p>Loading...</p>}>
        <OrderDataProvider
          data={{
            countries,
            drivers,
            cities,
            currencies,
            customers,
            trucks,
          }}
        >
          <div className="py-2 px-4 my-5">
            <Timeline searchParamsPromise={searchParams} />
          </div>
        </OrderDataProvider>
      </Suspense>
    </div>
  );
}
