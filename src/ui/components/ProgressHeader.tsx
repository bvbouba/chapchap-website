"use client";

import { ChevronRight, CheckIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useTripSearch } from "@/context/TripSearchContext";
import Link from "next/link";

interface Props {
    destinationName?: string;
    date?: string;
}

type StepKey = "depart" | "return" | "summary" | "checkout";

function getCurrentStepFromPath(pathname: string): StepKey {
    if (pathname.includes("/trips")) return "depart";
    if (pathname.includes("/return")) return "return";
    if (pathname.includes("/cart")) return "summary";
    if (pathname.includes("/checkout")) return "checkout";
    return "depart";
}

export default function ProgressHeader({ destinationName, date }: Props) {
    const pathname = usePathname();
    const currentStep = getCurrentStepFromPath(pathname);
    const { data } = useTripSearch();
    const params = useParams<{ channel: string }>();

    const getStepHref = (stepKey: string): string => {
        const channel = params.channel || "ci";
        
        // 🚩 Robust check for missing context or missing IDs
        const originId = data?.origin?.id;
        const destinationId = data?.destination?.id;
    
        // If IDs are missing, empty strings, or null/undefined
        if (!originId || !destinationId) {
            return `/${channel}`; 
        }
    
        switch (stepKey) {
            case "depart":
                return `/${channel}/trips/${originId}/${destinationId}`;
            case "return":
                // For the return trip, we swap origin and destination IDs
                return `/${channel}/return/${destinationId}/${originId}`;
            case "summary":
                return `/${channel}/cart`;
            default:
                return `/${channel}`;
        }
    };

    const formattedDate = date
        ? new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        })
        : "";

    // 🧭 Step Configuration
    const baseSteps = [
        {
            key: "depart" as StepKey,
            // Restore your specific logic for the departure label
            activeLabel: (
                <span className="inline-flex items-end">
                    <span className="font-semibold">{`Départ vers ${destinationName}`}</span>
                    {formattedDate && <span>&nbsp;le {formattedDate}</span>}
                </span>
            ),
            inactiveLabel: "Départ",
        },
        ...(data?.tripType === "roundtrip" 
            ? [{ key: "return" as StepKey, activeLabel: <span className="font-semibold">Retour</span>, inactiveLabel: "Retour" }] 
            : []),
        {
            key: "summary" as StepKey,
            activeLabel: <span className="font-semibold">Résumé du voyage</span>,
            inactiveLabel: "Résumé",
        },
        {
            key: "checkout" as StepKey,
            activeLabel: <span className="font-semibold">Paiement</span>,
            inactiveLabel: "Paiement",
        },
    ];

    const currentIndex = baseSteps.findIndex((s) => s.key === currentStep);

    return (
        <div className="relative flex items-center justify-center border-b border-gray-300 bg-white shadow-md">
            <div className="flex w-full max-w-6xl items-center justify-between px-8 py-4 text-base">
                
                {/* LEFT: Completed and Active steps */}
                <div className="flex items-center gap-3">
                    {baseSteps.slice(0, currentIndex + 1).map((step, index) => {
                        const isCompleted = index < currentIndex;
                        const active = index === currentIndex;

                        return (
                            <div key={step.key} className="flex items-center gap-1">
                                {isCompleted ? (
                                    // ✅ Completed steps get the SHORT label + LINK + CHECK
                                    <Link 
                                        href={getStepHref(step.key)}
                                        className="flex items-center gap-1 text-gray-600 transition-colors hover:text-primary hover:underline"
                                    >
                                        <span className="text-base">{step.inactiveLabel}</span>
                                        <CheckIcon className="h-4 w-4 text-primary" />
                                    </Link>
                                ) : (
                                    // ✅ Active step gets your LONG descriptive label
                                    <div className="text-gray-900">
                                        {step.activeLabel}
                                    </div>
                                )}

                                {/* Chevron between left items */}
                                {index < currentIndex && (
                                    <ChevronRight className="mx-2 h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT: Remaining steps */}
                <div className="hidden items-center gap-3 text-gray-400 md:flex">
                    {baseSteps.slice(currentIndex + 1).map((step) => (
                        <div key={step.key} className="flex items-center gap-2">
                            <ChevronRight className="h-5 w-5 text-gray-300" />
                            <span className="text-base opacity-60">{step.inactiveLabel}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}