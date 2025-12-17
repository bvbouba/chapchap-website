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
      disabled={isButtonDisabled}
      onClick={handleClick}
      className="mt-2 bg-primary text-white py-2 px-4 rounded-md text-sm hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <div className="inline-flex items-center">
          <svg
            className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 
              5.373 0 12h4zm2 5.291A7.962 7.962 
              0 014 12H0c0 3.042 1.135 5.824 
              3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Traitement en cours…</span>
        </div>
      ) : (
        <span>Sélectionner</span>
      )}
    </button>
  );
}
