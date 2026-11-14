"use client";

import { X } from "lucide-react";
import { SectionFilter } from "./SectionFilter";
import { type FilterPill } from "../productList/FilteredProductList/FilterPills";
import { type ClientSortMode, type DeparturePeriod } from "../productList/FilteredProductList/sorting";
import { type AttributeFilterFragment } from "@/gql/graphql";

type Props = {
	open: boolean;
	onClose: () => void;
	pills: FilterPill[];
	clearFilters: () => Promise<void>;
	attributeFiltersData: AttributeFilterFragment[];
	addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
	sortMode: ClientSortMode;
	onSortModeChange: (mode: ClientSortMode) => void;
	periods: DeparturePeriod[];
	onTogglePeriod: (period: DeparturePeriod) => void;
	resultCount?: number | null;
};

export function TripsFilterModal({
	open,
	onClose,
	pills,
	clearFilters,
	attributeFiltersData,
	addAttributeFilter,
	sortMode,
	onSortModeChange,
	periods,
	onTogglePeriod,
	resultCount,
}: Props) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 md:hidden">
			<button
				type="button"
				aria-label="Fermer les filtres"
				className="absolute inset-0 bg-black/40"
				onClick={onClose}
			/>
			<div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-2xl bg-white shadow-xl">
				<div className="flex items-center justify-between border-b border-[#E8E9EC] px-4 py-3">
					<h2 className="text-lg font-bold text-[#111111]">Filtrer & trier</h2>
					<button
						type="button"
						onClick={onClose}
						className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F7F8] text-[#505050]"
						aria-label="Fermer"
					>
						<X className="h-5 w-5" />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto px-4 py-4">
					<SectionFilter
						compact
						pills={pills}
						clearFilters={clearFilters}
						attributeFiltersData={attributeFiltersData}
						addAttributeFilter={addAttributeFilter}
						sortMode={sortMode}
						onSortModeChange={onSortModeChange}
						periods={periods}
						onTogglePeriod={onTogglePeriod}
					/>
				</div>
				<div className="border-t border-[#E8E9EC] p-4">
					<button
						type="button"
						onClick={onClose}
						className="flex h-12 w-full items-center justify-center rounded-xl bg-[#EB1700] text-sm font-bold text-white"
					>
						{typeof resultCount === "number"
							? `Voir ${resultCount} résultat${resultCount > 1 ? "s" : ""}`
							: "Voir les résultats"}
					</button>
				</div>
			</div>
		</div>
	);
}
