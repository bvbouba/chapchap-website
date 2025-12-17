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

export default function FilterPills({
  pills,
  onRemoveAttribute,
  onClearFilters,
}: FilterPillsProps) {
  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 my-4">
      {pills.map(({ label, attributeSlug, choiceSlug }) => (
        <button
          key={`${attributeSlug}-${choiceSlug}`}
          onClick={() => onRemoveAttribute(attributeSlug, choiceSlug)}
          className="flex items-center gap-1 border border-gray-300 bg-white text-gray-700 px-3 py-1.5 rounded-md text-sm hover:bg-gray-100 transition"
        >
          <span>{label}</span>
          <X size={14} className="text-gray-500 hover:text-gray-700" />
        </button>
      ))}

      <button
        onClick={onClearFilters}
        className="ml-2 border border-primary text-primary px-3 py-1.5 rounded-md text-sm   hover:bg-primary hover:text-white transition"
      >
        Tout effacer
      </button>
    </div>
  );
}
