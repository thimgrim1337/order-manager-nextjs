"use client";

import { createContext, ReactNode, use } from "react";
import {
	City,
	Country,
	Currency,
	Customer,
	Driver,
	Truck,
} from "@/types/types";

type OrderDataContextType = {
	customers: Promise<Customer[]>;
	cities: Promise<City[]>;
	drivers: Promise<Driver[]>;
	trucks: Promise<Truck[]>;
	countries: Promise<Country[]>;
	currencies: Promise<Currency[]>;
};

const OrderDataContext = createContext<OrderDataContextType | null>(null);

export const useOrderData = () => {
	const ctx = use(OrderDataContext);

	if (!ctx)
		throw new Error("useOrderData must be used within OrderDataProvider");

	return ctx;
};

type OrderDataProviderProps = {
	dataPromise: OrderDataContextType;
	children: ReactNode;
};

export function OrderDataProvider({
	dataPromise,
	children,
}: OrderDataProviderProps) {
	return <OrderDataContext value={dataPromise}>{children}</OrderDataContext>;
}
