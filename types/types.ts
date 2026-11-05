import type { OrderSortField } from '@/lib/consts';
import type { CityDto } from '@/lib/dto/city.dto';
import type { CountryDto } from '@/lib/dto/country.dto';
import type { CurrencyDto } from '@/lib/dto/currency.dto';
import type { CustomerDto } from '@/lib/dto/customer.dto';
import type { DriverDto } from '@/lib/dto/driver.dto';
import type { StatusDto } from '@/lib/dto/status.dto';
import type { TruckDto } from '@/lib/dto/truck.dto';

export type City = CityDto;
export type Country = CountryDto;
export type Customer = CustomerDto;
export type Driver = DriverDto;
export type Truck = TruckDto;
export type Status = StatusDto;
export type Currency = CurrencyDto;

/** A Currency's code, as the NBP API takes it. */
export type CurrencyCode = Currency['code'];

export type CurrencyInfo = {
  date: string;
  table: string;
  rate: string;
};
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
