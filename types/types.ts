import z from 'zod';
import { CityDto } from '@/lib/dto/city.dto';
import { CountryDto } from '@/lib/dto/country.dto';
import { CustomerDto } from '@/lib/dto/customer.dto';
import { DriverDto } from '@/lib/dto/driver.dto';
import { OrderDto } from '@/lib/dto/order.dto';
import { TruckDto } from '@/lib/dto/truck.dto';
import { ReactNode } from 'react';

export type Order = OrderDto;
export type City = CityDto;
export type Country = CountryDto;
export type Customer = CustomerDto;
export type Driver = DriverDto;
export type Truck = TruckDto;

export type Currencies = 'PLN' | 'EUR';

export type CurrencyInfo = {
  date: string;
  table: string;
  rate: string;
};

export type SortOptions = {
  id: string;
  desc: boolean;
};

export const SearchParams = z.object({
  sort: z
    .templateLiteral([z.string(), '.', z.enum(['asc', 'desc'])])
    .optional(),
  globalFilters: z.string().optional(),
  pageIndex: z.number().min(0).default(0).optional(),
  pageSize: z.number().min(10).max(100).default(10).optional(),
  customer: z.string().optional(),
});
export type SearchParams = z.infer<typeof SearchParams>;

export type FieldData = {
  id?: number;
  value: string;
  icon?: ReactNode;
};

export type ApiResult<TData = unknown> =
  | { type: 'success'; data: TData; status: number }
  | { type: 'error'; error: string; status: number };

export type FormActionResult<T extends Record<string, any>> =
  | { success: true; data: T }
  | { success: false; errors: Partial<Record<keyof T, string[]>> };
