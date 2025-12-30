"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
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
					<div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-2xl bg-white p-10 text-center shadow-2xl">
						<p className="mt-3 text-sm leading-relaxed text-gray-500">
							{/* ✅ Correction de l'apostrophe ici */}
							Pour garantir l&apos;exactitude des tarifs et des places disponibles, votre session doit être
							actualisée.
						</p>

						<button
							onClick={handleRefresh}
							className="mt-8 w-full rounded-xl bg-secondary py-4 text-sm font-bold uppercase text-white shadow-lg shadow-primary/20 transition-all hover:bg-secondary-dark active:scale-95"
						>
							Rafraîchir
						</button>
					</div>
				</div>
			)}
		</SessionTimerContext.Provider>
	);
}
