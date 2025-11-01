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
      <div className="w-full flex justify-between items-center py-4 px-6 max-w-6xl">
        {/* Partie gauche */}
        <div className="text-gray-800">
          Départ vers{" "}
          <span className="font-semibold text-[#97D700]">{destinationName}</span>{" "}
          le{" "}
          <span className="text-[#97D700]">{formattedDate}</span>
        </div>

        {/* Partie droite */}
        <div className="flex items-center text-sm text-gray-500">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="mx-1 text-gray-700">Résumé du voyage</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="ml-1 font-semibold text-gray-700">Paiement</span>
        </div>
      </div>
    </div>
  );
}
