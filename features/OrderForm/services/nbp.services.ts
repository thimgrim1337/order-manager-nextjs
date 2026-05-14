import { apiCall } from "@/lib/helpers";
import { Currencies, CurrencyTable } from "@/types/types";

export type NBPApiResponse = {
	table: string;
	currency: string;
	code: string;
	rates: [
		{
			no: string;
			effectiveDate: string;
			mid: number;
		},
	];
};

export async function getCurrencyRate(
	date: string,
	code: Currencies = "EUR",
	table: CurrencyTable = "A",
) {
	if (code === "PLN" || !date) return null;

	const result = await apiCall<NBPApiResponse>(
		`https://api.nbp.pl/api/exchangerates/rates/${table}/${code}/${date}/?format=json`,
	);

	if (result.type === "error") {
		if (result.status === 404)
			throw new Error("Nie znaleziono kursu dla wskazanej daty.");
		throw new Error("Nie udało się pobrać kursu walut.");
	}

	return result.data;
}
