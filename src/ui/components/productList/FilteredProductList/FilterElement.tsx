"use client";

import { useState } from "react";
import clsx from "clsx";
import { CheckIcon, ChevronDown, ChevronRight } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  slug: string;
  chosen: boolean;
}

export interface FilterProps {
  label: string;
  attributeSlug: string;
  options?: FilterOption[];
  optionToggle: (attributeSlug: string, choiceSlug: string) => void;
}

export function FilterElement({
  label,
  attributeSlug,
  options,
  optionToggle,
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-6">
      {/* Header: label + toggle */}
      <button
        type="button"
        className="flex items-center justify-between w-full text-lg font-semibold mb-2 text-gray-800 border-b border-gray-200 pb-1 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Collapsible options list */}
      {isOpen && (
        <ul className="space-y-2 mt-2">
          {options?.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => optionToggle(attributeSlug, option.slug)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-all duration-150",
                  option.chosen
                    ? "border-[#97D700] bg-[#f6ffe0] text-[#2e5500]"
                    : "border-gray-200 hover:border-[#97D700] hover:bg-gray-50 text-gray-700"
                )}
              >
                <span>{option.label}</span>
                {option.chosen && (
                  <CheckIcon className="h-4 w-4 text-[#97D700]" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FilterElement;
