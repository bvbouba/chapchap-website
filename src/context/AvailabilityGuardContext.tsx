"use client";
import { createContext, useContext, type ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import { type CheckoutFragment } from "@/gql/graphql";
import { extractAttributesFromCHeckout } from "@/lib/attribute";

interface AvailabilityContextType {
	checkAvailability: (checkout: CheckoutFragment) => boolean;
}

const AvailabilityContext = createContext<AvailabilityContextType>({
	checkAvailability: () => true,
});

export const useAvailability = () => useContext(AvailabilityContext);

export function AvailabilityProvider({ children }: { children: ReactNode }) {
	const [isSoldOut, setIsSoldOut] = useState(false);
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [lastCheckoutData, setLastCheckoutData] = useState<CheckoutFragment | null>(null);

	const params = useParams<{ channel: string }>();

	const checkAvailability = (checkout: CheckoutFragment): boolean => {
		if (isRedirecting) return true;
		if (!checkout?.lines) return true;

		const hasStockIssue = checkout.lines.some(
			(line) => line.quantity > (line.variant?.quantityAvailable ?? 0),
		);

		if (hasStockIssue) {
			setLastCheckoutData(checkout);
			setIsSoldOut(true);
			return false;
		}

		setIsSoldOut(false);
		return true;
	};

	const handleRedirect = () => {
		setIsRedirecting(true);
		setIsSoldOut(false);

		const channel = Array.isArray(params.channel) ? params.channel[0] : params.channel;

		const { originId, destinationId, date } = extractAttributesFromCHeckout(lastCheckoutData);

		const targetUrl = channel
			? originId && destinationId
				? `/${channel}/trips/${originId}/${destinationId}?date=${date}`
				: `/${channel}`
			: "/";

		window.location.href = targetUrl;
	};

	return (
		<AvailabilityContext.Provider value={{ checkAvailability }}>
			{children}

			{(isSoldOut || isRedirecting) && (
				<div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
					<div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
						{isRedirecting ? (
							<div className="flex flex-col items-center py-10">
								<div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-secondary" />
								<p className="font-medium text-gray-600">Recherche de nouveaux trajets...</p>
							</div>
						) : (
							<>
								<div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-10 w-10"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>
								</div>
								<h2 className="text-2xl font-bold text-gray-900">Billet épuisé</h2>
								<p className="mt-4 text-sm leading-relaxed text-gray-500">
									{/* ✅ Corrections apportées ici */}
									Désolé, les places pour ce trajet spécifique viennent d&apos;être réservées. Souhaitez-vous
									voir les autres horaires disponibles pour cet itinéraire ?
								</p>
								<button
									onClick={handleRedirect}
									className="mt-8 w-full rounded-xl bg-secondary py-4 text-sm font-bold text-white shadow-lg shadow-secondary/20 transition-all hover:bg-secondary-dark active:scale-95"
								>
									VOIR LES AUTRES HORAIRES
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</AvailabilityContext.Provider>
	);
}
