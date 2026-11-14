import { OrderDirection, ProductVariantSortField } from "@/gql/graphql";

export type ClientSortMode = "chaplist" | "cheapest" | "earliest";

export interface UrlSorting {
	field: ProductVariantSortField;
	direction: OrderDirection;
}

export interface SortingOption {
	label: string;
	mode: ClientSortMode;
	field?: ProductVariantSortField;
	direction?: OrderDirection;
	chosen: boolean;
}

export function getClientSortMode(chosenSorting: UrlSorting | null, sortByQuery: string | null): ClientSortMode {
	if (sortByQuery === "EARLIEST" || sortByQuery === "earliest") return "earliest";
	if (chosenSorting?.field === ProductVariantSortField.Price && chosenSorting.direction === OrderDirection.Asc) {
		return "cheapest";
	}
	return "chaplist";
}

export const getSortingOptions = (chosenSorting: UrlSorting | null, sortByQuery: string | null = null) => {
	const mode = getClientSortMode(chosenSorting, sortByQuery);
	const options: SortingOption[] = [
		{ label: "Plus tôt", mode: "earliest", chosen: mode === "earliest" },
		{
			label: "Moins cher",
			mode: "cheapest",
			field: ProductVariantSortField.Price,
			direction: OrderDirection.Asc,
			chosen: mode === "cheapest",
		},
		{ label: "ChapList", mode: "chaplist", chosen: mode === "chaplist" },
	];
	return options;
};

export const parseQuerySort = (query: string | null): UrlSorting | null => {
	if (!query || query === "EARLIEST" || query === "earliest") {
		return null;
	}
	const [field, direction] = query.split("_");
	if (!field || !direction) {
		return null;
	}
	return {
		field: field as ProductVariantSortField,
		direction: direction as OrderDirection,
	};
};

export const serializeQuerySort = (value?: UrlSorting | null) => {
	if (value?.direction && value?.field) {
		return `${value.field}_${value.direction}`;
	}
	return null;
};

/** Departure time-of-day bands used as client-side filters. */
export type DeparturePeriod = "aube" | "matin" | "apres-midi" | "soir";

export const DEPARTURE_PERIODS: Array<{
	id: DeparturePeriod;
	label: string;
	hint: string;
	startHour: number;
	endHour: number;
}> = [
	{ id: "aube", label: "Aube", hint: "04h – 08h", startHour: 4, endHour: 8 },
	{ id: "matin", label: "Matin", hint: "08h – 12h", startHour: 8, endHour: 12 },
	{ id: "apres-midi", label: "Après-midi", hint: "12h – 18h", startHour: 12, endHour: 18 },
	{ id: "soir", label: "Soir", hint: "18h +", startHour: 18, endHour: 24 },
];

export function parseDeparturePeriods(query: string | null): DeparturePeriod[] {
	if (!query?.trim()) return [];
	const allowed = new Set(DEPARTURE_PERIODS.map((p) => p.id));
	return query
		.split(".")
		.map((v) => v.trim() as DeparturePeriod)
		.filter((v) => allowed.has(v));
}

export function serializeDeparturePeriods(values: DeparturePeriod[]): string | null {
	return values.length ? values.join(".") : null;
}

export function getDepartureHour(dateTimeRaw?: string | null): number | null {
	if (!dateTimeRaw) return null;
	const d = new Date(dateTimeRaw);
	if (Number.isNaN(d.getTime())) return null;
	return d.getHours() + d.getMinutes() / 60;
}

export function matchesDeparturePeriods(
	dateTimeRaw: string | null | undefined,
	periods: DeparturePeriod[],
): boolean {
	if (!periods.length) return true;
	const hour = getDepartureHour(dateTimeRaw);
	if (hour == null) return false;
	return periods.some((id) => {
		const band = DEPARTURE_PERIODS.find((p) => p.id === id);
		if (!band) return false;
		return hour >= band.startHour && hour < band.endHour;
	});
}
