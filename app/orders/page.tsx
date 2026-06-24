import { Suspense } from "react";
import PageHeader from "@/components/ui/page-header";
import CreateOrder from "@/features/OrderForm/components/create-order";
import OrdersTable from "@/features/OrdersTable/components/orders-table";
import OrderTableFilter from "@/features/OrdersTable/components/orders-table-filter";
import { OrderDataProvider } from "@/features/shared/context/order-context";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/consts";
import { getAllCities } from "@/lib/dal/city.dal";
import { getAllCountries } from "@/lib/dal/country.dal";
import { getAllCurrencies } from "@/lib/dal/currency.dal";
import { getAllCustomers } from "@/lib/dal/customer.dal.";
import { getAllDrivers } from "@/lib/dal/driver.dal";
import { getAllOrders, getOrderCount } from "@/lib/dal/order.dal";
import { getAllTrucks } from "@/lib/dal/truck.dal";
import { omit } from "@/lib/helpers";
import { sortToState } from "@/lib/utils";
import {
	OrderFilters,
	OrderTable,
	SearchParams,
	SortParams,
} from "@/types/types";

async function getOrders(
	pageIndex: number,
	pageSize: number,
	sortParams?: SortParams[],
	globalFilters?: OrderFilters["globalFilters"],
): Promise<OrderTable[]> {
	const orders = await getAllOrders(pageIndex, pageSize, sortParams, {
		globalFilters,
	});

	return orders.map((order) =>
		omit(order, ["createdAt", "updatedAt", "driver", "truck"]),
	);
}

export default async function OrdersPage({
	searchParams,
}: {
	searchParams?: Promise<SearchParams>;
}) {
	const validatedSearchParams = await SearchParams.parseAsync(
		await searchParams,
	);

	const sort = validatedSearchParams?.sort || "";
	const sortParams = sortToState(sort);
	const pageIndex = validatedSearchParams?.pageIndex || DEFAULT_PAGE_INDEX;
	const pageSize = validatedSearchParams?.pageSize || DEFAULT_PAGE_SIZE;
	const globalFilters = validatedSearchParams?.globalFilters || "";

	const rowCount = await getOrderCount();

	const orders = getOrders(pageIndex, pageSize, sortParams, globalFilters);
	const customers = getAllCustomers();
	const cities = getAllCities();
	const drivers = getAllDrivers();
	const trucks = getAllTrucks();
	const countries = getAllCountries();
	const currencies = getAllCurrencies();

	return (
		<div className="w-[90%] m-auto my-5 px-5">
			<PageHeader
				title="Zlecenia"
				subText="System zarządzania zleceniami transportowymi."
			/>

			<Suspense fallback={<p>Loading...</p>}>
				<OrderDataProvider
					dataPromise={{
						customers,
						cities,
						drivers,
						trucks,
						countries,
						currencies,
					}}
				>
					<div className="flex gap-2 justify-between border rounded-md py-2 px-4 my-5">
						<OrderTableFilter />
						<CreateOrder />
					</div>

					<OrdersTable orders={orders} rowCount={rowCount[0].count} />
				</OrderDataProvider>
			</Suspense>
		</div>
	);
}
