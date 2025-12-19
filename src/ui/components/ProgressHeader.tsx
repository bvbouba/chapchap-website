"use client";

import { ChevronRight, CheckIcon } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useTripSearch } from "@/context/TripSearchContext";
import { CheckoutFragment } from "@/gql/graphql";

interface Props {
	destinationName?: string;
	date?: string;
	checkout?: CheckoutFragment;
}

type StepKey = "depart" | "return" | "summary" | "checkout";

/**
 * Map URL → step
 */
function getCurrentStepFromPath(pathname: string): StepKey {
	if (pathname.includes("/trips")) return "depart";
	if (pathname.includes("/return")) return "return";
	if (pathname.includes("/cart")) return "summary";
	if (pathname.includes("/checkout")) return "checkout";

	// fallback (safe default)
	return "depart";
}

export default function ProgressHeader({ destinationName, date, checkout }: Props) {
	const pathname = usePathname();
	const currentStep = getCurrentStepFromPath(pathname);
	const { data } = useTripSearch();
	const params = useParams<{ channel: string }>();

	const attributes = checkout?.lines[0].variant.attributes || [];

	console.log(attributes);

	// router.push(`/${params.channel}/trips/${values.origin.id}/${values.destination.id}`);

	const formattedDate = date
		? new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
				day: "2-digit",
				month: "long",
				year: "numeric",
				timeZone: "UTC",
			})
		: "";

	// 🧭 Steps
	const baseSteps = [
		{
			key: "depart",
			label:
				currentStep === "depart" ? (
					<span className="inline-flex items-end">
						<span className="font-semibold">{`Départ vers ${destinationName}`}</span>
						{formattedDate && <span className="">&nbsp;le {formattedDate}</span>}
					</span>
				) : (
					"Départ"
				),
		},
		...(data?.tripType === "roundtrip" ? [{ key: "return", label: "Retour" }] : []),
		{
			key: "summary",
			label:
				currentStep === "summary" ? (
					<span className="font-semibold">Résumé du voyage</span>
				) : (
					"Résumé du voyage"
				),
		},
		{
			key: "checkout",
			label: currentStep === "checkout" ? <span className="font-semibold">Paiement</span> : "Paiement",
		},
	] as const;

	const currentIndex = baseSteps.findIndex((s) => s.key === currentStep);

	const isCompleted = (stepKey: string) => baseSteps.findIndex((s) => s.key === stepKey) < currentIndex;

	const isActive = (stepKey: string) => stepKey === currentStep;

	const leftSteps = baseSteps.slice(0, currentIndex + 1);
	const rightSteps = baseSteps.slice(currentIndex + 1);

	return (
		<div className="relative flex items-center justify-center border-b border-gray-300 bg-white shadow-md">
			<div className="flex w-full max-w-6xl items-center justify-between px-8 py-4 text-base">
				{/* LEFT (completed + active) */}
				<div className="flex items-center gap-3 text-gray-700">
					{leftSteps.map((step, index) => (
						<div key={step.key} className="flex items-center gap-1">
							{/* Dot */}
							{!isCompleted(step.key) && !isActive(step.key) && (
								<div className="h-4 w-4 rounded-full border-2 border-gray-300" />
							)}

							{/* Label */}
							<span
								className={
									isActive(step.key) || isCompleted(step.key)
										? "text-base text-gray-700"
										: "text-base text-gray-500"
								}
							>
								{step.label}
							</span>

							{/* Check AFTER label */}
							{isCompleted(step.key) && <CheckIcon className="ml-1 h-4 w-4 text-primary" />}

							{/* Chevron */}
							{index < leftSteps.length - 1 && <ChevronRight className="mx-2 h-5 w-5 text-gray-400" />}
						</div>
					))}
				</div>

				{/* RIGHT (remaining) */}
				<div className="flex items-center gap-3 text-gray-500">
					{rightSteps.map((step) => (
						<div key={step.key} className="flex items-center gap-2">
							<ChevronRight className="h-6 w-6 text-gray-300" />
							<span className="text-base">{step.label}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
