"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterElement } from "../productList/FilteredProductList/FilterElement";
import { type FilterPill } from "../productList/FilteredProductList/FilterPills";
import { getFilterOptions } from "../productList/FilteredProductList/attributes";
import {
	DEPARTURE_PERIODS,
	type ClientSortMode,
	type DeparturePeriod,
} from "../productList/FilteredProductList/sorting";
import { type AttributeFilterFragment } from "@/gql/graphql";

interface Props {
	pills: FilterPill[];
	clearFilters: () => Promise<void>;
	attributeFiltersData: AttributeFilterFragment[];
	addAttributeFilter: (attributeSlug: string, choiceSlug: string) => void;
	sortMode: ClientSortMode;
	onSortModeChange: (mode: ClientSortMode) => void;
	periods: DeparturePeriod[];
	onTogglePeriod: (period: DeparturePeriod) => void;
	compact?: boolean;
}

export const SectionFilter = ({
	pills,
	clearFilters,
	attributeFiltersData,
	addAttributeFilter,
	sortMode,
	onSortModeChange,
	periods,
	onTogglePeriod,
	compact = false,
}: Props) => {
	const [garesOpen, setGaresOpen] = useState(true);
	const [periodOpen, setPeriodOpen] = useState(true);
	const [companiesOpen, setCompaniesOpen] = useState(true);
	const [amenitiesOpen, setAmenitiesOpen] = useState(true);

	const STOP_SLUGS = ["departure-station", "arrival-station"];
	const HANDLED_SLUGS = new Set([
		...STOP_SLUGS,
		"bus-operator",
		"amenities",
		// Handled by our custom period bands — hide Saleor duplicate filters
		"departure-time",
		"departure-period",
		"periode-de-depart",
		"period",
		"estimated-duration",
		"departure-city",
		"arrival-city",
	]);

	const stopAttributes = attributeFiltersData.filter((attr) => STOP_SLUGS.includes(attr.slug!));
	const companyAttr = attributeFiltersData.find((attr) => attr.slug === "bus-operator");
	const amenitiesAttr = attributeFiltersData.find((attr) => attr.slug === "amenities");
	const otherAttributes = attributeFiltersData.filter((attr) => {
		const slug = (attr.slug || "").toLowerCase();
		const name = (attr.name || "").toLowerCase();
		if (HANDLED_SLUGS.has(slug)) return false;
		if (name.includes("période") || name.includes("periode")) return false;
		return true;
	});

	return (
		<aside className={compact ? "flex w-full flex-col gap-5" : "hidden w-full flex-col gap-5 md:flex md:w-[26%] md:shrink-0"}>
			{pills.length > 0 ? (
				<div className="border-b border-[#E8E9EC] pb-3">
					<button
						type="button"
						onClick={() => void clearFilters()}
						className="text-sm font-semibold text-[#EB1700] transition hover:underline"
					>
						Réinitialiser tous les filtres
					</button>
				</div>
			) : null}

			<div className="border-b border-[#E8E9EC] pb-4">
				<h3 className="text-sm font-bold uppercase tracking-wide text-[#606060]">Trier par</h3>
				<div className="mt-3 space-y-2">
					{(
						[
							{ mode: "earliest" as const, label: "Heure de départ (plus tôt)" },
							{ mode: "cheapest" as const, label: "Prix le plus bas" },
							{ mode: "chaplist" as const, label: "ChapList (recommandé)" },
						] as const
					).map((opt) => (
						<label key={opt.mode} className="flex cursor-pointer items-center gap-2 text-sm text-[#303030]">
							<input
								type="radio"
								name="trip-sort"
								checked={sortMode === opt.mode}
								onChange={() => onSortModeChange(opt.mode)}
								className="border-[#C8C9CE] text-[#EB1700] focus:ring-[#EB1700]"
							/>
							{opt.label}
						</label>
					))}
				</div>
			</div>

			<div className="border-b border-[#E8E9EC] pb-4">
				<button
					type="button"
					onClick={() => setPeriodOpen((v) => !v)}
					className="flex w-full items-center justify-between text-left"
				>
					<span className="text-sm font-bold uppercase tracking-wide text-[#606060]">
						Période de départ
					</span>
					{periodOpen ? (
						<ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
					) : (
						<ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
					)}
				</button>
				{periodOpen ? (
					<ul className="mt-3 space-y-2">
						{DEPARTURE_PERIODS.map((band) => (
							<li key={band.id}>
								<label className="flex cursor-pointer items-center gap-2 text-sm text-[#303030]">
									<input
										type="checkbox"
										checked={periods.includes(band.id)}
										onChange={() => onTogglePeriod(band.id)}
										className="rounded border-[#C8C9CE] text-[#EB1700] focus:ring-[#EB1700]"
									/>
									<span>
										{band.label}{" "}
										<span className="text-[#9CA3AF]">({band.hint})</span>
									</span>
								</label>
							</li>
						))}
					</ul>
				) : null}
			</div>

			{stopAttributes.length > 0 ? (
				<div className="border-b border-[#E8E9EC] pb-4">
					<button
						type="button"
						onClick={() => setGaresOpen((v) => !v)}
						className="flex w-full items-center justify-between text-left"
					>
						<span className="text-sm font-bold uppercase tracking-wide text-[#606060]">
							Gares / embarquement
						</span>
						{garesOpen ? (
							<ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
						) : (
							<ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
						)}
					</button>
					{garesOpen ? (
						<div className="mt-3 space-y-2">
							{stopAttributes.map((attribute) => (
								<FilterElement
									key={attribute.id}
									label={attribute.name || ""}
									attributeSlug={attribute.slug!}
									optionToggle={addAttributeFilter}
									options={getFilterOptions(attribute, pills)}
									borderless
								/>
							))}
						</div>
					) : null}
				</div>
			) : null}

			{companyAttr ? (
				<div className="border-b border-[#E8E9EC] pb-4">
					<button
						type="button"
						onClick={() => setCompaniesOpen((v) => !v)}
						className="flex w-full items-center justify-between text-left"
					>
						<span className="text-sm font-bold uppercase tracking-wide text-[#606060]">Compagnies</span>
						{companiesOpen ? (
							<ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
						) : (
							<ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
						)}
					</button>
					{companiesOpen ? (
						<div className="mt-3">
							<FilterElement
								label=""
								attributeSlug={companyAttr.slug!}
								optionToggle={addAttributeFilter}
								options={getFilterOptions(companyAttr, pills)}
								borderless
							/>
						</div>
					) : null}
				</div>
			) : null}

			{amenitiesAttr ? (
				<div className="border-b border-[#E8E9EC] pb-4">
					<button
						type="button"
						onClick={() => setAmenitiesOpen((v) => !v)}
						className="flex w-full items-center justify-between text-left"
					>
						<span className="text-sm font-bold uppercase tracking-wide text-[#606060]">Commodités</span>
						{amenitiesOpen ? (
							<ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
						) : (
							<ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
						)}
					</button>
					{amenitiesOpen ? (
						<div className="mt-3">
							<FilterElement
								label=""
								attributeSlug={amenitiesAttr.slug!}
								optionToggle={addAttributeFilter}
								options={getFilterOptions(amenitiesAttr, pills)}
								borderless
							/>
						</div>
					) : null}
				</div>
			) : null}

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
