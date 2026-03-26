import { HttpResponse, http } from "msw";

export const mockRate = {
	rates: [
		{
			no: "107/NBP/A",
			mid: 4.25,
			effectiveDate: "2021-01-15",
		},
	],
};

export const mockHoliday = {
	id: "1",
	startDate: "2024-01-15",
	endDate: "2024-01-15",
	nationalwide: true,
	type: "Public",
	regionalScope: "National",
	temporalScope: "FullDay",
	name: ["PL", "Święto"],
	comment: [{ language: "PL", text: "" }],
	subdivisions: ["PL", "PL"],
};

export const handlers = [
	http.get<{ table: string; code: string; date: string }>(
		"https://api.nbp.pl/api/exchangerates/rates/:table/:code/:date/",
		() => {
			return HttpResponse.json(mockRate);
		},
	),

	http.get("https://openholidaysapi.org/PublicHolidays", () => {
		return HttpResponse.json([]);
	}),
];
