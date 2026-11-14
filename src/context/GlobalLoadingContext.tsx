"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useState, type ReactNode, useEffect } from "react";
import Image from "next/image";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";

type imageType = {
	url: string;
	alt?: string | null;
};

interface LoadingState {
	active: boolean;
	companyLogo?: imageType;
	companyName?: string;
	destination?: string;
}

interface GlobalLoadingContextType {
	isLoading: boolean;
	loadingState: LoadingState;
	setLoading: (
		active: boolean,
		opts?: {
			companyLogo?: imageType;
			companyName?: string;
			destination?: string;
		},
	) => void;
}

function buildSubtitle(companyName?: string, destination?: string): string {
	const company = companyName?.trim();
	const dest = destination?.trim();

	if (dest && company) {
		return `Réservation de votre siège pour ${dest} chez ${company}...`;
	}
	if (company) {
		return `Nous bloquons votre siège chez ${company}...`;
	}
	if (dest) {
		return `Réservation de votre siège pour ${dest}...`;
	}
	return "Réservation de votre siège en cours...";
}

const GlobalLoadingContext = createContext<GlobalLoadingContextType>({
	isLoading: false,
	loadingState: { active: false },
	setLoading: () => {},
});

export const useGlobalLoading = () => useContext(GlobalLoadingContext);

export function GlobalLoadingProvider({ children }: { children: ReactNode }) {
	const [loadingState, setLoadingState] = useState<LoadingState>({ active: false });
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const setLoading = (
		active: boolean,
		opts?: {
			companyLogo?: imageType;
			companyName?: string;
			destination?: string;
		},
	) => {
		setLoadingState({
			active,
			companyLogo: opts?.companyLogo,
			companyName: opts?.companyName,
			destination: opts?.destination,
		});
	};

	useEffect(() => {
		setLoading(false);
	}, [pathname, searchParams]);

	return (
		<GlobalLoadingContext.Provider value={{ isLoading: loadingState.active, loadingState, setLoading }}>
			{loadingState.active ? (
				<div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-7">
					<div className="flex w-full max-w-[340px] flex-col items-center rounded-[20px] border border-[#E8E9EC] bg-white px-[22px] py-7 shadow-xl">
						<div className="mb-4 flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-[28px] border border-[#E8E9EC] bg-white">
							<div className="relative h-[88px] w-[88px]">
								<Image src="/logo.png" alt="ChapChap" fill className="object-contain p-2" priority />
							</div>
						</div>

						<div className="mb-4">
							<EllipsisLoader color="#EB1700" dotSize={7} />
						</div>

						<p className="mb-2 text-center text-[17px] font-bold text-[#111111]">
							Vérification de la disponibilité...
						</p>
						<p className="px-1 text-center text-sm leading-5 text-[#606060]">
							{buildSubtitle(loadingState.companyName, loadingState.destination)}
						</p>
					</div>
				</div>
			) : null}
			{children}
		</GlobalLoadingContext.Provider>
	);
}
