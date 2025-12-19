"use client";

import { ChevronRight, CheckIcon } from "lucide-react";

export default function CartHeader() {
	return (
		<div className="relative flex items-center justify-center border-b border-gray-300 bg-white">
			<div className="flex w-full max-w-6xl items-center justify-between px-8 py-4 text-sm">
				{/* Étapes de progression */}
				<div className="flex items-center gap-3 text-gray-700  ">
					{/* Étape 1 : Départ */}
					<div className="flex items-center">
						<CheckIcon className="mr-1 h-4 w-4 text-primary" />
						<span>Départ</span>
					</div>

					<ChevronRight className="h-4 w-4 text-gray-400" />

					{/* Étape 2 : Résumé du voyage (actuelle) */}
					<div className="flex items-center">
						<span className="text-[#d13b3b]">Résumé du voyage</span>
					</div>

					<ChevronRight className="h-4 w-4 text-gray-400" />

					{/* Étape 3 : Paiement */}
					<div className="flex items-center text-gray-500">
						<span>Paiement</span>
					</div>
				</div>
			</div>
		</div>
	);
}
