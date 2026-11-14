"use client";

import { CheckIcon, ChevronRight } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useTripSearch } from "@/context/TripSearchContext";
import { type CheckoutFragment } from "@/gql/graphql";
import { extractAttributesFromCHeckout } from "@/lib/attribute";

interface Props {
	destinationName?: string;
	date?: string;
	checkout?: CheckoutFragment;
}

type StepKey = "depart" | "return" | "summary" | "checkout";

function getCurrentStepFromPath(pathname: string): StepKey {
	if (pathname.includes("/trips")) return "depart";
	if (pathname.includes("/return")) return "return";
	if (pathname.includes("/cart")) return "summary";
	if (pathname.includes("/checkout")) return "checkout";
	return "depart";
}

/** Booking progress: Recherche → Ma réservation → Passagers & paiement */
export function ProgressHeader({ checkout }: Props) {
	const pathname = usePathname();
	const currentStep = getCurrentStepFromPath(pathname);
	const { data } = useTripSearch();
	const params = useParams<{ channel: string }>();

	const getStepHref = (stepKey: string): string => {
		const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;
		if (!channel) return "/";

		const { originId, destinationId, date: checkoutDate } = extractAttributesFromCHeckout(checkout);

		if (!originId || !destinationId || !checkoutDate) {
			return `/${channel}`;
		}

		switch (stepKey) {
			case "depart":
				return `/${channel}/trips/${originId}/${destinationId}?date=${checkoutDate}`;
			case "return":
				return `/${channel}/return/${destinationId}/${originId}`;
			case "summary":
				return `/${channel}/cart`;
			default:
				return `/${channel}`;
		}
	};

	const baseSteps = [
		{
			key: "depart" as StepKey,
			label: "Recherche",
		},
		...(data?.tripType === "roundtrip"
			? [
					{
						key: "return" as StepKey,
						label: "Retour",
					},
				]
			: []),
		{
			key: "summary" as StepKey,
			label: "Ma réservation",
		},
		{
			key: "checkout" as StepKey,
			label: "Passagers & paiement",
		},
	];

	const currentIndex = baseSteps.findIndex((s) => s.key === currentStep);

	return (
		<div className="border-b border-[#E8E9EC] bg-white">
			<nav
				aria-label="Progression de la réservation"
				className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 overflow-x-auto px-4 py-3 sm:px-8"
			>
				<div className="flex min-w-0 items-center gap-1 sm:gap-2">
					{baseSteps.map((step, index) => {
						const isCompleted = index < currentIndex;
						const isCurrent = index === currentIndex;
						const showChevron = index < baseSteps.length - 1;

						return (
							<div key={step.key} className="flex shrink-0 items-center gap-1 sm:gap-2">
								{isCompleted ? (
									<Link
										href={getStepHref(step.key)}
										className="inline-flex items-center gap-1 text-sm text-[#606060] transition hover:text-[#111111] hover:underline"
									>
										<span className="hidden sm:inline">{index + 1}.</span> {step.label}
										<CheckIcon className="h-3.5 w-3.5 text-[#A6C65A]" aria-hidden />
									</Link>
								) : (
									<span
										className={
											isCurrent
												? "text-sm font-bold text-[#111111]"
												: "text-sm text-[#9CA3AF]"
										}
									>
										<span className="hidden sm:inline">{index + 1}.</span> {step.label}
									</span>
								)}
								{showChevron ? (
									<ChevronRight className="h-4 w-4 text-[#D5D6DB]" aria-hidden />
								) : null}
							</div>
						);
					})}
				</div>
			</nav>
		</div>
	);
}
