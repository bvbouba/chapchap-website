"use client";

import { useState } from "react";
import { EllipsisLoader } from "./EllipsisLoader";

interface AddButtonProps {
	disabled?: boolean;
	addItem: () => Promise<void>;
	isNavigating?: boolean;
}

export function AddButton({ disabled, addItem, isNavigating }: AddButtonProps) {
	const [isActionLoading, setIsActionLoading] = useState(false);

	const isLoading = isActionLoading || isNavigating;
	const isButtonDisabled = disabled || isLoading;

	const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (isButtonDisabled) return;

		setIsActionLoading(true);
		try {
			await addItem();
		} finally {
			setIsActionLoading(false);
		}
	};

	return (
		<button
			type="button"
			disabled={isButtonDisabled}
			onClick={handleClick}
			className="inline-flex h-10 min-w-[7.5rem] items-center justify-center rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white transition hover:bg-[#c91400] disabled:cursor-not-allowed disabled:bg-neutral-300"
		>
			{isLoading ? <EllipsisLoader color="#FFFFFF" dotSize={6} /> : "Réserver"}
		</button>
	);
}
