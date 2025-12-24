"use client";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import Image from "next/image";

type imageType = {
    url: string;
    alt?: string | null;
}

interface LoadingState {
    active: boolean;
    companyLogo?: imageType; // ✅ Updated to use your type
}

interface GlobalLoadingContextType {
    isLoading: boolean;
    loadingState: LoadingState;
    setLoading: (active: boolean, companyLogo?: imageType) => void;
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

    const setLoading = (active: boolean, companyLogo?: imageType) => {
        setLoadingState({ active, companyLogo });
    };

    useEffect(() => {
        setLoading(false);
    }, [pathname, searchParams]);

    return (
        <GlobalLoadingContext.Provider value={{ isLoading: loadingState.active, loadingState, setLoading }}>
            {loadingState.active && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="flex flex-col items-center rounded-2xl bg-white p-8 shadow-2xl max-w-sm w-full mx-4">
                        
                        {/* --- Animation Section --- */}
                        <div className="flex items-center justify-between w-full mb-8 px-2">
                            {/* Your Brand Logo */}
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-100 bg-white p-2 shadow-sm">
                                <Image 
                                    src="/logo.png" 
                                    alt="ChapChap Tickets" 
                                    width={48} 
                                    height={48} 
                                    className="object-contain" 
                                />
                            </div>

                            {/* Animated Connection Dots */}
                            <div className="flex flex-1 items-center justify-center gap-2">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                            </div>

                            {/* Partner Logo */}
                            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 border-gray-100 bg-gray-50 p-2 shadow-sm">
                                {loadingState.companyLogo?.url ? (
                                    <Image 
                                        src={loadingState.companyLogo.url} 
                                        alt={loadingState.companyLogo.alt ?? "Partenaire"} 
                                        fill
                                        className="object-contain p-2" 
                                    />
                                ) : (
                                    <div className="h-8 w-8 animate-pulse text-gray-300">
                                        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Text Feedback */}
                        <div className="text-center">
                            <p className="text-base font-bold text-gray-900">Vérification des places</p>
                            <p className="mt-2 text-sm text-gray-500">
                                Nous sécurisons votre trajet auprès de notre partenaire...
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {children}
        </GlobalLoadingContext.Provider>
    );
}