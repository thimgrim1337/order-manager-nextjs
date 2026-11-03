import { Loader2 } from "lucide-react";
import { toPricePLN } from "@/lib/prices";
import { CurrencyInfo as TCurrencyInfo } from "@/types/types";

export default function CurrencyInfo({
	currencyCode,
	isLoading,
	currencyInfo,
	priceCurrency,
}: {
	currencyCode: string;
	isLoading: boolean;
	currencyInfo?: TCurrencyInfo | null;
	priceCurrency: string;
}) {
	const content = isLoading ? (
		<>
			<Loader2 className="h-3 w-3 animate-spin" />
			<span>Pobieranie kursu waluty...</span>
		</>
	) : currencyInfo?.rate ? (
		<div className="flex flex-col">
			<span>
				{/* An Order's stored Exchange Rate comes without NBP's table number. */}
				{currencyInfo.table ? `Tabela nr ${currencyInfo.table}` : "Kurs"} z dnia{" "}
				{currencyInfo.date}, 1 {currencyCode} = {currencyInfo.rate} PLN
			</span>
			{Number(priceCurrency) > 0 && (
				<span>Cena w PLN: {toPricePLN(priceCurrency, currencyInfo.rate)}</span>
			)}
		</div>
	) : null;

	if (!content) return null;

	return (
		<div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
			{content}
		</div>
	);
}
