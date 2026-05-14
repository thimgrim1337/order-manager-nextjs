import { useEffect, useState } from "react";

export default function useSearchQuery<T>(
	searchFn: (query: string) => Promise<T[]>,
	initialData: T[],
	delay = 300,
) {
	const [query, setQuery] = useState("");
	const [data, setData] = useState<T[]>(initialData);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <It's ok>
	useEffect(() => {
		if (!query) return setData(initialData);

		const controller = new AbortController();

		const timer = setTimeout(async () => {
			const result = await searchFn(query);
			if (!controller.signal.aborted) setData(result);
		}, delay);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [query]);

	return { data, setQuery };
}
