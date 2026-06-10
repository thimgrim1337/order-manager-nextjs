import { useState } from "react";
import { SelectData } from "../components/FormFields/select-field";

const STORAGE_KEY = (id: string) => `select-recent-values-${id}`;
const MAX_RECENT = 5;

export default function useRecentValues(allOptions: SelectData[], id: string) {
	const [recentValuesList, setRecentValues] =
		useState<number[]>(getRecentValues);

	function getRecentValues(): number[] {
		return JSON.parse(localStorage.getItem(STORAGE_KEY(id)) ?? "[]");
	}

	function addRecentValues(newItem: number) {
		const prev = getRecentValues();
		const updated = [newItem, ...prev.filter((item) => item !== newItem)].slice(
			0,
			MAX_RECENT,
		);

		localStorage.setItem(STORAGE_KEY(id), JSON.stringify(updated));

		return updated;
	}

	const trackValue = (value: number) => setRecentValues(addRecentValues(value));

	const recentValues = recentValuesList
		.map((value) => allOptions.find((o) => o.value === value))
		.filter((o) => o != undefined);

	return { recentValues, trackValue };
}
