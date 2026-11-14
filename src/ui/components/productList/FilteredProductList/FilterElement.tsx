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
	borderless?: boolean;
}

export function FilterElement({ label, attributeSlug, options, optionToggle, borderless }: FilterProps) {
	const [isOpen, setIsOpen] = useState(Boolean(borderless) || !label);

	return (
		<div className={`py-2 ${borderless ? "" : "border-b border-gray-300 py-4"}`}>
			{label ? (
				<button
					type="button"
					className="flex w-full items-center justify-between text-sm text-gray-800"
					onClick={() => setIsOpen((prev) => !prev)}
				>
					<span className={`font-semibold ${borderless ? "text-sm uppercase text-gray-500" : "text-lg"}`}>
						{label}
					</span>
					{borderless ? null : isOpen ? (
						<ChevronUp className="h-3 w-3 text-gray-500" />
					) : (
						<ChevronDown className="h-3 w-3 text-gray-500" />
					)}
				</button>
			) : null}

			{(isOpen || borderless || !label) && (
				<ul className="mt-2 space-y-1">
					{options?.map((option) => (
						<li key={option.id}>
							<label
								className={clsx(
									"flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm transition",
									option.chosen
										? "text-[#2e5500]"
										: "text-gray-700 hover:bg-gray-50",
								)}
							>
								<input
									type="checkbox"
									checked={option.chosen}
									onChange={() => optionToggle(attributeSlug, option.slug)}
									className="h-4 w-4 cursor-pointer accent-primary"
								/>
								<span className="flex-1">{option.label}</span>
							</label>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
