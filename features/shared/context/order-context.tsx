'use client';

import { createContext, type ReactNode, useContext } from 'react';
import type { City, Country, Currency, Customer, Driver, Status, Truck } from '@/types/types';

type OrderDataContextType = {
  customers: Customer[];
  cities: City[];
  drivers: Driver[];
  trucks: Truck[];
  countries: Country[];
  currencies: Currency[];
  statuses: Status[];
};

const OrderDataContext = createContext<OrderDataContextType | null>(null);

export const useOrderData = () => {
  const ctx = useContext(OrderDataContext);

  if (!ctx) throw new Error('useOrderData must be used within OrderDataProvider');

  return ctx;
};

type OrderDataProviderProps = {
  data: OrderDataContextType;
  children: ReactNode;
};

export function OrderDataProvider({ data, children }: OrderDataProviderProps) {
  return <OrderDataContext value={data}>{children}</OrderDataContext>;
}
