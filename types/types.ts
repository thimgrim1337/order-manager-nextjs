import type { ReactNode } from 'react';
import z from 'zod';
import { getFirstDayOfWeek, getLastDayOfWeek, getToday } from '@/lib/dates';
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
const ALLOWED_SORT_FIELDS = [
  'statusId',
  'truckId',
  'loadingCity',
  'unloadingCity',
  'orderNr',
  'startDate',
  'endDate',
  'pricePLN',
  'priceCurrency',
  'currencyId',
  'customerId',
];

const AllowedSortField = z.templateLiteral([
  z.enum(ALLOWED_SORT_FIELDS),
  '.',
  z.enum(['desc', 'asc']),
]);

export type SortParams = {
  id: string;
  desc: boolean;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

const OrderFilters = z.object({
  driverId: z.coerce.number().min(1).max(100).optional().catch(1),
  statusId: z.coerce.number().min(1).max(3).optional().catch(1),
  startDate: z.iso.date().optional().default(getFirstDayOfWeek(getToday())),
  endDate: z.iso.date().optional().default(getLastDayOfWeek(getToday())),
  globalFilters: z.string().optional(),
});
export type OrderFilters = z.infer<typeof OrderFilters>;

export const SearchParams = z.object({
  sort: z.string().pipe(AllowedSortField).optional(),
  pageIndex: z.coerce.number().min(0).default(0).catch(0),
  pageSize: z.coerce.number().min(10).max(100).default(10).catch(10),
  ...OrderFilters.shape,
});

export type SearchParams = z.infer<typeof SearchParams>;

export type FieldData = {
  id?: number;
  value: string;
  icon?: ReactNode;
};

export type Day = {
  date: string;
  name: string;
};
