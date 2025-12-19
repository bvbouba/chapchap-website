"use client";

import { useState } from "react";

interface AddButtonProps {
	disabled?: boolean;
	addItem: () => Promise<void>;
}

export function AddButton({ disabled, addItem }: AddButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const isButtonDisabled = disabled || isLoading;

	const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		if (isButtonDisabled) return;
		setIsLoading(true);
		await addItem();
		setIsLoading(false);
	};

	return (
		<button
			type="button"
			disabled={isButtonDisabled || isLoading}
			onClick={handleClick}
			className="mt-2 rounded-md bg-secondary px-4 py-2 text-sm text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-70"
		>
			<span className="text-sm font-semibold uppercase tracking-widest">réserver</span>
		</button>
	);
}
