import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import CreateOrderForm from "@/features/OrderForm/components/create-order";
import OrdersTable from "@/features/OrdersTable/components/orders-table";
import OrderTableFilter from "@/features/OrdersTable/components/orders-table-filter";
import { OrderDataProvider } from "@/features/shared/context/order-context";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/consts";
import { getAllCities } from "@/lib/dal/city.dal";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllCustomers } from "@/lib/dal/customer.dal.";
import { getAllDrivers } from "@/lib/dal/driver.dal";
import { getAllOrders, getOrderCount } from "@/lib/dal/order.dal";
import { getAllTrucks } from "@/lib/dal/truck.dal";
import { sortToState } from "@/lib/utils";
import { SearchParams } from "@/types/types";

export default async function OrdersPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const sort = (await searchParams)?.sort || "";
	const globalFilters = (await searchParams)?.globalFilters || "";
	const pageIndex =
		Number((await searchParams)?.pageIndex) || DEFAULT_PAGE_INDEX;
	const pageSize = Number((await searchParams)?.pageSize) || DEFAULT_PAGE_SIZE;

	const sortOptions = sortToState(sort)[0];
	const rowCount = await getOrderCount();

	const orders = getAllOrders(pageIndex, pageSize, sortOptions, globalFilters);
	const customers = getAllCustomers();
	const cities = getAllCities();
	const drivers = getAllDrivers();
	const trucks = getAllTrucks();
	const countries = getAllCountries();

	return (
		<div className="w-[90%] m-auto my-5">
			<PageHeader
				title="Zlecenia"
				subText="System zarządzania zleceniami transportowymi"
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<OrderDataProvider
					dataPromise={{
						customers,
						cities,
						drivers,
						trucks,
						countries,
					}}
				>
					<div className="flex gap-2 justify-between border rounded-md py-2 px-4 my-5">
						<OrderTableFilter />
						<CreateOrderForm />
					</div>

					<OrdersTable orders={orders} rowCount={rowCount[0].count} />
				</OrderDataProvider>
			</Suspense>
		</div>
	);
}
