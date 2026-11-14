"use client";

import { X } from "lucide-react";

export interface FilterPill {
	label: string;
	choiceSlug: string;
	attributeSlug: string;
}

export interface FilterPillsProps {
	pills: FilterPill[];
	onRemoveAttribute: (attributeSlug: string, choiceSlug: string) => void;
	onClearFilters: () => void;
}

export default function FilterPills({ pills, onRemoveAttribute, onClearFilters }: FilterPillsProps) {
	if (pills.length === 0) return null;

	return (
		<div className="flex flex-wrap items-center gap-2">
			{pills.map(({ label, attributeSlug, choiceSlug }) => (
				<button
					key={`${attributeSlug}-${choiceSlug}`}
					type="button"
					onClick={() => onRemoveAttribute(attributeSlug, choiceSlug)}
					className="inline-flex items-center gap-1.5 rounded-full border border-[#E2E3E7] bg-white px-3 py-1.5 text-xs font-medium text-[#303030] transition hover:border-[#EB1700] hover:text-[#EB1700]"
				>
					<span>{label.includes(": ") ? label.split(": ").slice(1).join(": ") : label}</span>
					<X size={12} className="text-[#9CA3AF]" />
				</button>
			))}

			<button
				type="button"
				onClick={onClearFilters}
				className="text-xs font-semibold text-[#EB1700] underline"
			>
				Tout effacer
			</button>
		</div>
	);
}
