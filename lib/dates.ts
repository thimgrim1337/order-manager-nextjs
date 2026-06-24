import {
	addDays,
	eachDayOfInterval,
	endOfWeek,
	format,
	isFuture,
	isWeekend,
	parse,
	startOfWeek,
	subDays,
} from "date-fns";
import { pl } from "date-fns/locale";

export const formatDate = (
	date: Date | number | string | undefined,
	dateFormat: string = "yyyy-MM-dd",
) => {
	if (!date) return "";

	return format(date, dateFormat, { locale: pl });
};

export const parseDate = (date: string, dateFormat: string = "yyyy-MM-dd") =>
	parse(date, dateFormat, new Date());

export const getToday = () => formatDate(Date.now());
export const getTomorrow = () => formatDate(addDays(getToday(), 1));
export const getYesterday = (date: Date | string) =>
	formatDate(subDays(date, 1));
export const getWeekDays = (date: string) =>
	eachDayOfInterval({
		start: startOfWeek(date, { weekStartsOn: 1 }),
		end: endOfWeek(date, { weekStartsOn: 1 }),
	}).map((date) => {
		const day = formatDate(date, "yyyy-MM-dd iii").split(" ");

		return {
			date: day[0],
			name: day[1],
		};
	});

export { isFuture, isWeekend, subDays };
