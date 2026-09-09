import {
	getFirstDayOfWeek,
	getLastDayOfWeek,
	getToday,
	getWeek,
	subDays,
} from "@/lib/dates";

export function getWeeksStartDates() {
	const weeksStartDates: {
		weekNumber: number;
		startDate: string;
		endDate: string;
	}[] = [];

	const actualWeekNumber = getWeek(getToday());

	let index = actualWeekNumber;
	let startDate = getFirstDayOfWeek(getToday());
	let endDate = getLastDayOfWeek(startDate);

	while (index >= 1) {
		weeksStartDates.push({
			weekNumber: index,
			startDate,
			endDate,
		});
		startDate = getFirstDayOfWeek(subDays(startDate, 7));
		endDate = getLastDayOfWeek(startDate);

		index--;
	}
	return weeksStartDates;
}
