"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterElement } from "../productList/FilteredProductList/FilterElement";
import { type FilterPill } from "../productList/FilteredProductList/FilterPills";
import { getFilterOptions } from "../productList/FilteredProductList/attributes";
import { type AttributeFilterFragment } from "@/gql/graphql";

interface props {
	pills: FilterPill[];
	clearFilters: () => Promise<void>;
	attributeFiltersData: AttributeFilterFragment[];
	addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
}

export const SectionFilter = ({ pills, clearFilters, attributeFiltersData, addAttributeFilter }: props) => {
	const [stopsOpen, setStopsOpen] = useState(false);

	const STOP_SLUGS = ["departure-station", "arrival-station"];

	const stopAttributes = attributeFiltersData.filter((attr) => STOP_SLUGS.includes(attr.slug!));

	const otherAttributes = attributeFiltersData.filter((attr) => !STOP_SLUGS.includes(attr.slug!));

	return (
		<aside className="mb-6 flex w-1/4 flex-col gap-4 md:w-1/4">
			{/* Reset filters */}
			{pills.length > 0 && (
				<div className="mb-6 border-b border-gray-200">
					<button
						onClick={clearFilters}
						className="rounded-md py-2 pr-4 text-sm text-primary transition hover:text-red-600"
					>
						Réinitialiser tous les filtres
					</button>
				</div>
			)}

			{/* 🛑 STOPS GROUP */}
			{stopAttributes.length > 0 && (
				<div className="border-b border-gray-300 pb-4">
					{/* Group header */}
					<button
						type="button"
						onClick={() => setStopsOpen((v) => !v)}
						className="flex w-full items-center justify-between text-sm text-gray-800"
					>
						<span className="text-lg font-semibold">Gares</span>
						{stopsOpen ? (
							<ChevronUp className="h-4 w-4 text-gray-500" />
						) : (
							<ChevronDown className="h-4 w-4 text-gray-500" />
						)}
					</button>

					{/* Group content */}
					{stopsOpen && (
						<div className="mt-3 space-y-2 pl-2">
							{stopAttributes.map((attribute) => (
								<FilterElement
									key={attribute.id}
									label={attribute.name || ""}
									attributeSlug={attribute.slug!}
									optionToggle={addAttributeFilter}
									options={getFilterOptions(attribute, pills)}
									borderless={true}
								/>
							))}
						</div>
					)}
				</div>
			)}

			{/* 🔹 OTHER ATTRIBUTES */}
			{otherAttributes.map((attribute) => (
				<FilterElement
					key={attribute.id}
					label={attribute.name || ""}
					attributeSlug={attribute.slug!}
					optionToggle={addAttributeFilter}
					options={getFilterOptions(attribute, pills)}
				/>
			))}
		</aside>
	);
};
