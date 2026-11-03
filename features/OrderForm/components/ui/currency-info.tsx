import { Loader2 } from "lucide-react";
import { CurrencyInfo as TCurrencyInfo } from "@/types/types";

export default function CurrencyInfo({
	currencyCode,
	isLoading,
	currencyInfo,
}: {
	currencyCode: string;
	isLoading: boolean;
	currencyInfo?: TCurrencyInfo | null;
}) {
	const content = isLoading ? (
		<>
			<Loader2 className="h-3 w-3 animate-spin" />
			<span>Pobieranie kursu waluty...</span>
		</>
	) : currencyInfo?.rate ? (
		<span>
			Tabela nr {currencyInfo.table} z dnia {currencyInfo.date}, 1 {currencyCode} ={" "}
			{currencyInfo.rate} PLN
		</span>
	) : null;

	if (!content) return null;

	return (
		<div className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
			{content}
		</div>
	);
}
