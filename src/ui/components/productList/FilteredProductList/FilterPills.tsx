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
		<div className="my-4 flex flex-wrap items-center gap-2">
			{pills.map(({ label, attributeSlug, choiceSlug }) => (
				<button
					key={`${attributeSlug}-${choiceSlug}`}
					onClick={() => onRemoveAttribute(attributeSlug, choiceSlug)}
					className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
				>
					<span>{label}</span>
					<X size={14} className="text-gray-500 hover:text-gray-700" />
				</button>
			))}

			<button
				onClick={onClearFilters}
				className="ml-2 rounded-md border border-primary px-3 py-1.5 text-sm text-primary   transition hover:bg-primary hover:text-white"
			>
				Tout effacer
			</button>
		</div>
	);
}
