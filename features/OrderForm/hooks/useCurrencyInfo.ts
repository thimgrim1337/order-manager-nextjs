import { useQuery } from "@tanstack/react-query";
import { getToday } from "@/lib/dates";
import { getValidCurrencyDate } from "../lib/utils";
import { getCurrencyRate } from "../services/nbp.services";
import { getHolidays } from "../services/openHolidays.services";

export default function useCurrencyInfo(date: string) {
	const { data: holidays = [], isLoading: isHolidaysLoading } = useQuery({
		queryKey: ["holidays"],
		queryFn: () => getHolidays(),
	});

	const validDate = holidays.length
		? getValidCurrencyDate(date, holidays)
		: isHolidaysLoading
			? getToday()
			: date;

	const {
		data: rate,
		isLoading: isRateLoading,
		isError: isRateError,
		error: rateError,
	} = useQuery({
		queryKey: ["currencyRate", validDate],
		queryFn: () => getCurrencyRate(validDate),
		retry: false,
		enabled: !!validDate && !isHolidaysLoading,
	});

	return {
		rate,
		isRateLoading: isRateLoading || isHolidaysLoading,
		isRateError,
		rateError,
	};
}
