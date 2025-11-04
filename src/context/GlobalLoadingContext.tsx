"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface GlobalLoadingContextType {
  isLoading: boolean;
  setLoading: (v: boolean) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
  isLoading: false,
  setLoading: () => {},
});

export const useGlobalLoading = () => useContext(GlobalLoadingContext);

interface GlobalLoadingProviderProps {
  children: ReactNode;
}

export function GlobalLoadingProvider({ children }: GlobalLoadingProviderProps) {
  const [isLoading, setLoading] = useState(false);

  return (
    <GlobalLoadingContext.Provider value={{ isLoading, setLoading }}>
      {/* 🔄 Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex flex-col items-center">
            <svg
              className="animate-spin h-8 w-8 text-[#97D700] mb-3"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 
                   0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                   3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-800 font-medium text-sm">
              Connexion avec notre partenaire…
            </p>
          </div>
        </div>
      )}

      {/* Render children below overlay */}
      {children}
    </GlobalLoadingContext.Provider>
  );
}
