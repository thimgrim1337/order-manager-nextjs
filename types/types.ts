import { ReactNode } from "react";
import z from "zod";
import { CityDto } from "@/lib/dto/city.dto";
import { CountryDto } from "@/lib/dto/country.dto";
import { CurrencyDto } from "@/lib/dto/currency.dto";
import { CustomerDto } from "@/lib/dto/customer.dto";
import { DriverDto } from "@/lib/dto/driver.dto";
import { OrderWithDetailsDto } from "@/lib/dto/order.dto";
import { StatusDto } from "@/lib/dto/status.dto";
import { TruckDto } from "@/lib/dto/truck.dto";

export type Order = OrderWithDetailsDto;
export type City = CityDto;
export type Country = CountryDto;
export type Customer = CustomerDto;
export type Driver = DriverDto;
export type Truck = TruckDto;
export type Status = StatusDto;
export type Currency = CurrencyDto;

export type Currencies = "PLN" | "EUR";
export type PlaceType = "loadingPlace" | "unloadingPlace";

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
		.templateLiteral([z.string(), ".", z.enum(["asc", "desc"])])
		.optional(),
	globalFilters: z.string().optional(),
	pageIndex: z.number().min(0).default(0).optional(),
	pageSize: z.number().min(10).max(100).default(10).optional(),
});
export type SearchParams = z.infer<typeof SearchParams>;

export type FieldData = {
	id?: number;
	value: string;
	icon?: ReactNode;
};
