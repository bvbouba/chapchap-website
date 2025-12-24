"use client";

import { useState } from "react";

interface AddButtonProps {
    disabled?: boolean;
    addItem: () => Promise<void>;
    isNavigating?: boolean; // Add this prop
}

export function AddButton({ disabled, addItem, isNavigating }: AddButtonProps) {
    const [isActionLoading, setIsActionLoading] = useState(false);
    
    // The button is busy if the API is calling OR the page is changing
    const isLoading = isActionLoading || isNavigating;
    const isButtonDisabled = disabled || isLoading;

    const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
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
            className="mt-2 flex items-center justify-center min-w-[120px] rounded-md bg-secondary px-4 py-2 text-sm text-white transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
            {isLoading ? (
                // Simple inline spinner
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            ) : (
                <span className="text-sm font-semibold uppercase tracking-widest">réserver</span>
            )}
        </button>
    );
}
