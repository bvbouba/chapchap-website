"use client";

import { ChevronRight } from "lucide-react";

interface TripHeaderProps {
	destinationName: string;
	date: string;
}

export default function TripHeader({ destinationName, date }: TripHeaderProps) {
	const formattedDate = new Date(`${date}T00:00:00Z`).toLocaleDateString("fr-FR", {
		day: "2-digit",
		month: "long",
		year: "numeric",
		timeZone: "UTC", // ensure display stays in UTC
	});

	return (
		<div className="relative flex items-center justify-center border-b border-gray-300">
			<div className="flex w-full max-w-6xl items-center justify-between px-6 py-4">
				{/* Partie gauche */}
				<div className="text-gray-800">
					Départ vers <span className="text-primary">{destinationName}</span> le{" "}
					<span className="text-primary">{formattedDate}</span>
				</div>

				{/* Partie droite */}
				<div className="flex items-center text-sm text-gray-500">
					<ChevronRight className="h-4 w-4 text-gray-400" />
					<span className="mx-1 text-gray-700">Résumé du voyage</span>
					<ChevronRight className="h-4 w-4 text-gray-400" />
					<span className="ml-1 text-gray-700">Paiement</span>
				</div>
			</div>
		</div>
	);
}
