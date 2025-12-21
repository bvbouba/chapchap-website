"use client";

import { Menu, Transition } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, useState } from "react";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { getSortingOptions, UrlSorting } from "./sorting";
import { OrderDirection, ProductVariantSortField } from "@/gql/graphql";

export interface SortingDropdownProps {
	optionToggle: (field?: ProductVariantSortField, direction?: OrderDirection) => void;
	chosen: UrlSorting | null;
}

export function SortingDropdown({ optionToggle, chosen }: SortingDropdownProps) {
	const options = getSortingOptions(chosen);
	const [label, setLabel] = useState<string>("");

	return (
		<Menu as="div" className="relative inline-block text-left">
			{({ open }) => (
				<>
					<div>
						<Menu.Button
							className="focus:ring-brand inline-flex w-60 font-semibold text-sm items-center justify-between rounded-md border border-gray-200   bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
							data-testid="sortBy"
						>
							{label ? `Trier par: ${label}` : "Trier"}
							{open ? (
								<ChevronUpIcon className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
							) : (
								<ChevronDownIcon className="ml-2 h-5 w-5 text-gray-500" aria-hidden="true" />
							)}
						</Menu.Button>
					</div>

					<Transition
						as={Fragment}
						enter="transition ease-out duration-100"
						enterFrom="transform opacity-0 scale-95"
						enterTo="transform opacity-100 scale-100"
						leave="transition ease-in duration-75"
						leaveFrom="transform opacity-100 scale-100"
						leaveTo="transform opacity-0 scale-95"
					>
						<Menu.Items className="absolute z-10 mt-2 w-52 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
							{options?.map((option) => (
								<Menu.Item key={option.label}>
									{({ active }) => (
										<button
											type="button"
											onClick={() => {
												optionToggle(option.field, option.direction);
												setLabel(option.label);
											}}
											className={clsx(
												active ? "bg-gray-100 text-gray-900" : "text-gray-700",
												"group flex w-full items-center rounded-md px-4 py-2 text-sm",
											)}
											data-testid={`sortByOption${option.label}`}
										>
											{option.label}
											{option.chosen && (
												<CheckIcon className="ml-auto h-4 w-4 text-green-500" aria-hidden="true" />
											)}
										</button>
									)}
								</Menu.Item>
							))}
						</Menu.Items>
					</Transition>
				</>
			)}
		</Menu>
	);
}

export default SortingDropdown;
