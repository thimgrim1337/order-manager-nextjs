import type { ReactNode } from 'react';
import type { OrderSortField } from '@/lib/consts';
import type { CityDto } from '@/lib/dto/city.dto';
import type { CountryDto } from '@/lib/dto/country.dto';
import type { CurrencyDto } from '@/lib/dto/currency.dto';
import type { CustomerDto } from '@/lib/dto/customer.dto';
import type { DriverDto } from '@/lib/dto/driver.dto';
import type { OrderTableDto, OrderWithDetailsDto } from '@/lib/dto/order.dto';
import type { StatusDto } from '@/lib/dto/status.dto';
import type { TruckDto } from '@/lib/dto/truck.dto';

export type OrderWithDetails = OrderWithDetailsDto;
export type Order = OrderTableDto;
export type City = CityDto;
export type Country = CountryDto;
export type Customer = CustomerDto;
export type Driver = DriverDto;
export type Truck = TruckDto;
export type Status = StatusDto;
export type Currency = CurrencyDto;

export type Currencies = 'PLN' | 'EUR';

export type CurrencyTable = 'A' | 'B' | 'C';
export type PlaceType = 'loadingPlace' | 'unloadingPlace';

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

export type OrderFilters = {
  globalFilters?: string;
  startDate?: string;
  endDate?: string;
  driverId?: number;
  statusId?: number;
};

export type FieldData = {
  id?: number;
  value: string;
  icon?: ReactNode;
};

export type Day = {
  date: string;
  name: string;
  isWeekend: boolean;
};
