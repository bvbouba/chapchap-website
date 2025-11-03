"use client";

import { AttributeFilterFragment } from "@/gql/graphql";
import FilterElement from "../productList/FilteredProductList/FilterElement";
import { FilterPill } from "../productList/FilteredProductList/FilterPills";
import { getFilterOptions } from "../productList/FilteredProductList/attributes";

interface props {
    pills: FilterPill[];
    clearFilters: () => Promise<void>;
    attributeFiltersData: AttributeFilterFragment[]
    addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
}

export default function SectionFilter({ pills, clearFilters, attributeFiltersData, addAttributeFilter }: props) {

    return (
        <aside className="mb-6 flex flex-col gap-4">
            {/* Reset All Filters Button */}
            {pills.length > 0 && <div className="border-b border-gray-200 mb-6">
                <button
                    onClick={clearFilters}
                    className="py-2 text-[#97D700] px-4 rounded-md text-sm hover:text-red-600 transition"
                >
                    Réinitialiser tous les filtres
                </button>
            </div>}
            {/* Attribute Filters */}
            {attributeFiltersData.map((attribute) => (
                <FilterElement
                    key={attribute.id}
                    label={attribute.name || ""}
                    optionToggle={addAttributeFilter}
                    attributeSlug={attribute.slug!}
                    options={getFilterOptions(attribute, pills)}
                />
            ))}
        </aside>

    );
}
