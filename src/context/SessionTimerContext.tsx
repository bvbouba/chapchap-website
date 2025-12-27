"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface SessionTimerContextType {
    resetTimer: () => void;
    isExpired: boolean;
}

const SessionTimerContext = createContext<SessionTimerContextType>({
    resetTimer: () => {},
    isExpired: false,
});

export const useSessionTimer = () => useContext(SessionTimerContext);

const SESSION_DURATION = 10 * 60 * 1000; // 10 Minutes

export function SessionTimerProvider({ children }: { children: ReactNode }) {
    const [isExpired, setIsExpired] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActiveRoute = 
        pathname.includes("/trips") || 
        pathname.includes("/return") || 
        pathname.includes("/cart") || 
        pathname.includes("/checkout") ||
        pathname.includes("/categories");

    const resetTimer = () => {
        setIsExpired(false);
    };

    useEffect(() => {
        if (isActiveRoute) resetTimer();
    }, [pathname, searchParams, isActiveRoute]);

    useEffect(() => {
        if (!isActiveRoute || isExpired) return;

        const timer = setTimeout(() => {
            setIsExpired(true);
        }, SESSION_DURATION);

        return () => clearTimeout(timer);
    }, [isActiveRoute, isExpired, pathname]);

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <SessionTimerContext.Provider value={{ resetTimer, isExpired }}>
            {children}
            
            {/* 🛑 Full Screen Expiration Overlay */}
            {isActiveRoute && isExpired && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center rounded-2xl bg-white p-10 shadow-2xl max-w-sm w-full mx-4 text-center">
                        
        
                        <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                            Pour garantir l'exactitude des tarifs et des places disponibles, votre session doit être actualisée.
                        </p>

                        <button
                            onClick={handleRefresh}
                            className="mt-8 w-full uppercase rounded-xl bg-secondary py-4 text-sm font-bold text-white transition-all hover:bg-secondary-dark active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Rafraîchir
                        </button>
                    </div>
                </div>
            )}
        </SessionTimerContext.Provider>
    );
}