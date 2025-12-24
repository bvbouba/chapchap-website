"use client";
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { CheckoutFragment } from "@/gql/graphql";
import { useRouter, useParams } from "next/navigation";

interface AvailabilityContextType {
    checkAvailability: (checkout: CheckoutFragment) => boolean;
}

const AvailabilityContext = createContext<AvailabilityContextType>({
    checkAvailability: () => true,
});

export const useAvailability = () => useContext(AvailabilityContext);

export function AvailabilityProvider({ children }: { children: ReactNode }) {
    const [isSoldOut, setIsSoldOut] = useState(false);
    const router = useRouter();
    const params = useParams<{ channel: string }>();

    const checkAvailability = (checkout: CheckoutFragment): boolean => {
        if (!checkout?.lines) return true;

        const hasStockIssue = checkout.lines.some(
            (line) => line.quantity > (line.variant?.quantityAvailable ?? 0)
        );

        if (hasStockIssue) {
            setIsSoldOut(true);
            return false;
        }
        return true;
    };

    const handleRedirect = () => {
        setIsSoldOut(false);
        router.push(`/${params.channel || "ci"}`); // Go back to search
    };

    return (
        <AvailabilityContext.Provider value={{ checkAvailability }}>
            {children}

            {/* 🚨 Sold Out Global Overlay */}
            {isSoldOut && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 backdrop-blur-md">
                    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">Billet épuisé</h2>
                        <p className="mt-4 text-gray-500">
                            Désolé, les dernières places pour ce trajet viennent d'être réservées par d'autres voyageurs.
                        </p>

                        <button
                            onClick={handleRedirect}
                            className="mt-8 w-full rounded-xl bg-secondary py-4 text-sm font-bold text-white transition-all hover:bg-secondary-dark active:scale-95"
                        >
                            RECHERCHER UN AUTRE TRAJET
                        </button>
                    </div>
                </div>
            )}
        </AvailabilityContext.Provider>
    );
}