import { ReactNode } from "react";
import z from "zod";
import { getLastDayOfWeek, getToday } from "@/lib/dates";
import { CityDto } from "@/lib/dto/city.dto";
import { CountryDto } from "@/lib/dto/country.dto";
import { CurrencyDto } from "@/lib/dto/currency.dto";
import { CustomerDto } from "@/lib/dto/customer.dto";
import { DriverDto } from "@/lib/dto/driver.dto";
import {
	OrderTableDto,
	OrderTimelineDto,
	OrderWithDetailsDto,
} from "@/lib/dto/order.dto";
import { StatusDto } from "@/lib/dto/status.dto";
import { TruckDto } from "@/lib/dto/truck.dto";

export type Order = OrderWithDetailsDto;
export type OrderTable = OrderTableDto;
export type OrderTimeline = OrderTimelineDto;
export type City = CityDto;
export type Country = CountryDto;
export type Customer = CustomerDto;
export type Driver = DriverDto;
export type Truck = TruckDto;
export type Status = StatusDto;
export type Currency = CurrencyDto;

export type Currencies = "PLN" | "EUR";
export type CurrencyTable = "A" | "B" | "C";
export type PlaceType = "loadingPlace" | "unloadingPlace";

export type CurrencyInfo = {
	date: string;
	table: string;
	rate: string;
};
const ALLOWED_SORT_FIELDS = [
	"statusId",
	"truckId",
	"loadingCity",
	"unloadingCity",
	"orderNr",
	"startDate",
	"endDate",
	"pricePLN",
	"priceCurrency",
	"currencyId",
	"customerId",
];

const AllowedSortField = z.templateLiteral([
	z.enum(ALLOWED_SORT_FIELDS),
	".",
	z.enum(["desc", "asc"]),
]);

export type SortParams = {
	id: string;
	desc: boolean;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

export const TimetableFilters = z.object({
	driverId: z.coerce.number().min(1).max(100).optional().catch(1),
	startDate: z.iso.date().catch(getToday()),
	endDate: z.iso.date().catch(getLastDayOfWeek(getToday())),
});
export type TimetableFilters = z.infer<typeof TimetableFilters>;

const OrderFilters = z.object({
	globalFilters: z.string().optional(),
	...TimetableFilters.shape,
});
export type OrderFilters = z.infer<typeof OrderFilters>;

export const SearchParams = z.object({
	sort: z.string().pipe(AllowedSortField).optional().catch(undefined),
	pageIndex: z.coerce.number().min(0).default(0).optional().catch(0),
	pageSize: z.coerce.number().min(10).max(100).default(10).optional().catch(10),
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
