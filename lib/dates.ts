import {
	addDays as addDaysLib,
	eachDayOfInterval,
	endOfWeek,
	format,
	getWeek,
	isFuture,
	isWeekend,
	parse,
	startOfWeek,
	subDays as subDaysLib,
} from "date-fns";
import { pl } from "date-fns/locale";
import { Day } from "@/types/types";

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

export const getWeekDays = (date: string | Date): Day[] =>
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

export const subDays = (date: string | Date, amount: number) =>
	formatDate(
		subDaysLib(typeof date === "string" ? parseDate(date) : date, amount),
	);

export const addDays = (date: string | Date, amount: number) =>
	formatDate(
		addDaysLib(typeof date === "string" ? parseDate(date) : date, amount),
	);

export const getLastDayOfWeek = (date: string | Date) =>
	formatDate(
		endOfWeek(typeof date === "string" ? parseDate(date) : date, {
			weekStartsOn: 1,
		}),
	);

export const getFirstDayOfWeek = (date: string | Date) =>
	formatDate(
		startOfWeek(typeof date === "string" ? parseDate(date) : date, {
			weekStartsOn: 1,
		}),
	);

export { getWeek, isFuture, isWeekend };
