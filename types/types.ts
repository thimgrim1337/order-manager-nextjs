import type { OrderSortField } from '@/lib/consts';
import type { CityReadModel } from '@/lib/dal/city.dal';
import type { CountryReadModel } from '@/lib/dal/country.dal';
import type { CurrencyReadModel } from '@/lib/dal/currency.dal';
import type { CustomerReadModel } from '@/lib/dal/customer.dal';
import type { DriverReadModel } from '@/lib/dal/driver.dal';

export type City = CityReadModel;
export type Country = CountryReadModel;
export type Customer = CustomerReadModel;
export type Driver = DriverReadModel;

/** A Currency's code, as the NBP API takes it. */
export type CurrencyCode = CurrencyReadModel['code'];

export type SortParams = {
  id: OrderSortField;
  desc: boolean;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** The Orders Table's query, as the Order DAL takes it: its filters, one sort and one page. */
export type OrderQuery = {
  search?: string;
  startDate?: string;
  endDate?: string;
  driverId?: number;
  statusId?: number;
  sort?: SortParams;
  pageIndex: number;
  pageSize: number;
};

export type Day = {
  date: string;
  name: string;
  isWeekend: boolean;
};
