import { OpenHolidaysResponse } from "@/features/OrderForm/services/openHolidays.services";
import { getYesterday, isFuture, isWeekend, subDays } from "@/lib/dates";

export function getValidCurrencyDate(
	date: string,
	holidays: Pick<OpenHolidaysResponse, "endDate">[],
) {
	try {
		let yesterday;

		if (isFuture(date)) {
			yesterday = getYesterday(subDays(date, 1));
		} else {
			yesterday = getYesterday(date);
		}

		const isHoliday = holidays.some((day) => day.endDate === yesterday);

		if (!isWeekend(yesterday) && !isFuture(yesterday) && !isHoliday)
			return yesterday;

		return getValidCurrencyDate(yesterday, holidays);
	} catch (error) {
		console.log(error);
		return date;
	}
}
