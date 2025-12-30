"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Each city now has both slug and name
export interface CityValue {
	id: string;
	name: string;
	slug: string;
}

export interface TripSearchData {
	tripType: "oneway" | "roundtrip";
	origin: CityValue;
	destination: CityValue;
	date: string;
	returnDate?: string;
	query?: {
		origin: string;
		destination: string;
		date: string;
	};
}

// Context definition
interface TripSearchContextType {
	data: TripSearchData | null;
	setData: (values: TripSearchData) => void;
	clearData: () => void;
}

// Create context
const TripSearchContext = createContext<TripSearchContextType | undefined>(undefined);

// Provider
export function TripSearchProvider({ children }: { children: ReactNode }) {
	const [data, setData] = useState<TripSearchData | null>(null);

	const clearData = () => setData(null);

	return (
		<TripSearchContext.Provider value={{ data, setData, clearData }}>{children}</TripSearchContext.Provider>
	);
}

// Hook
export function useTripSearch() {
	const context = useContext(TripSearchContext);
	if (!context) {
		throw new Error("useTripSearch must be used within a TripSearchProvider");
	}
	return context;
}
