import { useQuery } from "@tanstack/react-query";
import { Currencies, CurrencyTable } from "@/types/types";
import { getValidCurrencyDate } from "../lib/utils";
import { getCurrencyRate } from "../services/nbp.services";
import { getHolidays } from "../services/openHolidays.services";

export default function useCurrencyInfo(
	date: string,
	currency: Currencies = "EUR",
	table: CurrencyTable = "A",
) {
	const holidaysQuery = useQuery({
		queryKey: ["holidays"],
		queryFn: () => getHolidays(),
		staleTime: 1000 * 60 * 60 * 24,
	});

	//   const validDate = holidays.length
	//     ? getValidCurrencyDate(date, holidays)
	//     : isHolidaysLoading
	//       ? getToday()
	//       : date;

	const validDate =
		!date || !holidaysQuery.data
			? null
			: getValidCurrencyDate(date, holidaysQuery.data);

	const rateQuery = useQuery({
		queryKey: ["currencyRate", validDate, currency, table],
		queryFn: () => getCurrencyRate(validDate!, currency, table),
		retry: false,
		enabled: !!validDate && !holidaysQuery.isLoading,
	});

	return {
		rate: rateQuery.data,
		isLoading: holidaysQuery.isLoading || rateQuery.isLoading,
		isError: holidaysQuery.isError || rateQuery.isError,
		error: holidaysQuery.error ?? rateQuery.error ?? null,
	};
}
