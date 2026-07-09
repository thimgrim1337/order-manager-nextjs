"use client";

import { createContext, ReactNode, use } from "react";
import { Country, Driver } from "@/types/types";

type TimelineDataContextType = {
	drivers: Promise<Driver[]>;
	countries: Promise<Country[]>;
};

const TimelineDataContext = createContext<TimelineDataContextType | null>(null);

export const useTimelineData = () => {
	const ctx = use(TimelineDataContext);

	if (!ctx) {
		throw new Error("useTimelineData must be used within TimelineDataProvider");
	}

	return ctx;
};

type TimelineDataProviderProps = {
	dataPromise: TimelineDataContextType;
	children: ReactNode;
};

export function TimelineDataProvider({
	dataPromise,
	children,
}: TimelineDataProviderProps) {
	return (
		<TimelineDataContext value={dataPromise}>{children}</TimelineDataContext>
	);
}
