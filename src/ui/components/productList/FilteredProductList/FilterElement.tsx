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
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={`py-4 ${borderless ? "" : "border-b"} border-gray-300`}>
			{/* Header */}
			<button
				type="button"
				className="flex w-full items-center justify-between text-sm text-gray-800"
				onClick={() => setIsOpen((prev) => !prev)}
			>
				<span className={`text-lg font-semibold ${borderless ? "text-sm uppercase text-gray-500" : ""}`}>
					{label}
				</span>
				{borderless ? (
					<></>
				) : isOpen ? (
					<ChevronUp className="h-3 w-3 text-gray-500" />
				) : (
					<ChevronDown className="h-3 w-3 text-gray-500" />
				)}
			</button>

			{/* Options */}
			{(isOpen || borderless) && (
				<ul className="mt-3 space-y-2">
					{options?.map((option) => (
						<li key={option.id}>
							<label
								className={clsx(
									"flex cursor-pointer items-center gap-3 rounded-lg px-3  py-2 text-sm transition",
									option.chosen
										? "border-primary text-[#2e5500]"
										: "border-gray-200 text-gray-700 hover:border-primary hover:bg-gray-50",
								)}
							>
								{/* ✅ Visible checkbox */}
								<input
									type="checkbox"
									checked={option.chosen}
									onChange={() => optionToggle(attributeSlug, option.slug)}
									className="h-4 w-4 cursor-pointer accent-primary"
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
