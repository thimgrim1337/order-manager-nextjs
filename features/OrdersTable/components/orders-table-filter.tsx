"use client";

import { Search } from "lucide-react";
import { Button } from "../../../components/ui/button";
import DebouncedInput from "../../../components/ui/debounced-input";
import useFilters from "../../shared/hooks/useFilters";

export default function OrderTableFilter() {
	const { filters, setFilters, resetFilters } = useFilters();

	return (
		<div className="flex-1 flex gap-2 items-center">
			<DebouncedInput
				className=" border rounded-md"
				onChange={(value) =>
					setFilters({
						globalFilters: typeof value === "string" ? value : value.toString(),
					})
				}
				placeholder={`Szukaj zleceń....`}
				value={filters.globalFilters || ""}
				icon={<Search className="text-muted-foreground" size={"1.5rem"} />}
			/>
			<Button onClick={() => resetFilters()} variant={"outline"}>
				Reset
			</Button>
		</div>
	);
}
