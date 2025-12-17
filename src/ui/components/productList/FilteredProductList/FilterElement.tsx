"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  borderless?:boolean;
}

export function FilterElement({
  label,
  attributeSlug,
  options,
  optionToggle,
  borderless
  
}: FilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`py-4 ${borderless ? "" : 'border-b'} border-gray-300`}>
      {/* Header */}
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm text-gray-800"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`font-semibold text-lg ${borderless ? "uppercase text-gray-500 text-sm" : ""}`}>{label}</span>
        {
        borderless ? <></> : (isOpen ? (
          <ChevronUp className="h-3 w-3 text-gray-500" />
        ) : (
          <ChevronDown className="h-3 w-3 text-gray-500" />
        ))
        
        }
      </button>

      {/* Options */}
      {(isOpen ||borderless ) && (
        <ul className="space-y-2 mt-3">
          {options?.map((option) => (
            <li key={option.id}>
              <label
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg  cursor-pointer text-sm transition",
                  option.chosen
                    ? "border-primary text-[#2e5500]"
                    : "border-gray-200 hover:border-primary hover:bg-gray-50 text-gray-700"
                )}
              >
                {/* ✅ Visible checkbox */}
                <input
                  type="checkbox"
                  checked={option.chosen}
                  onChange={() =>
                    optionToggle(attributeSlug, option.slug)
                  }
                  className="h-4 w-4 accent-primary cursor-pointer"
                  />

                {/* Label */}
                <span className="flex-1">{option.label}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FilterElement;
