"use client";

import { formatMoney } from "@/lib/utils";
import { ProductImageWrapper } from "../atoms/ProductImageWrapper";
import { ProductVariantListItemFragment } from "./graphql";

export function ProductElement({
	variant,
	priority
}: {
	variant: ProductVariantListItemFragment;
	loading: "eager" | "lazy";
	priority?: boolean;
}) {
	const attributes = variant.attributes || [];

	// Helper: get attribute value (name or value)
	const getAttrValue = (
		attrs: typeof attributes,
		slug: string
	): string | undefined => {
		const found = attrs.find((attr) => attr.attribute?.slug === slug);
		return found?.values?.[0]?.name ?? found?.values?.[0]?.value ?? undefined;
	};

	// Parse duration string into total minutes
	const parseDurationToMinutes = (raw?: string): number => {
		if (!raw) return 0;
		const s = raw.trim().toLowerCase();

		// Pure number (assume minutes) e.g. "150"
		if (/^\d+$/.test(s)) return parseInt(s, 10);

		// Minutes suffix e.g. "150min" or "150 min"
		const minMatch = s.match(/^(\d+)\s*min(?:ute)?s?$/);
		if (minMatch) return parseInt(minMatch[1], 10);

		// Hours and minutes format e.g. "2h30", "2 h 30", "2h", "2 h"
		const hmMatch = s.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?/);
		if (hmMatch) {
			const h = parseInt(hmMatch[1], 10);
			const m = hmMatch[2] ? parseInt(hmMatch[2], 10) : 0;
			return h * 60 + m;
		}

		// Colon format e.g. "2:30" or "02:30" => hours:minutes
		const colonMatch = s.match(/^(\d{1,2}):(\d{2})$/);
		if (colonMatch) {
			const h = parseInt(colonMatch[1], 10);
			const m = parseInt(colonMatch[2], 10);
			return h * 60 + m;
		}

		// Fallback: try to extract any number (assume minutes)
		const numMatch = s.match(/(\d+)/);
		if (numMatch) return parseInt(numMatch[1], 10);

		return 0;
	};

	// Format minutes to "XhYY" or "Zmin"
	const formatMinutes = (mins: number): string | null => {
		if (!mins || mins <= 0) return null;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		if (h === 0) return `${m}min`;
		return `${h}h${m.toString().padStart(2, "0")}`;
	};

	// Extract attributes
	const durationRaw = getAttrValue(attributes, "estimated-duration"); // could be "150", "150min", "2h30"
	const company = getAttrValue(attributes, "bus-operator");

	const departureStation = getAttrValue(attributes, "departure-station");
	const arrivalStation = getAttrValue(attributes, "arrival-station");
	const dateTime = getAttrValue(attributes, "departure-time"); // ISO date-time

	// Compute times (UTC)
	const departureDate = dateTime ? new Date(dateTime) : null;

	// Always use UTC for calculation and display (so no local timezone shift)
	const formatTimeUTC = (d: Date) =>
		d.toLocaleTimeString("fr-FR", {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});

	const durationMinutes = parseDurationToMinutes(durationRaw);
	const readableDuration = formatMinutes(durationMinutes);

	let arrivalTimeStr: string | null = null;
	if (departureDate && durationMinutes > 0) {
		const arrivalMs = departureDate.getTime() + durationMinutes * 60_000;
		const arrivalDate = new Date(arrivalMs);
		arrivalTimeStr = formatTimeUTC(arrivalDate);
	}

	const departureTimeStr = departureDate ? formatTimeUTC(departureDate) : "— —";

	return (
		<div
			key={variant.id}
			className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition"
		>
			{/* LEFT SIDE: company + times */}
			<div className="flex flex-col">
				{/* Company row (now at top) */}
				<div className="flex items-center gap-2 mb-3">
					{variant.product.thumbnail?.url && (
						<ProductImageWrapper
						src={variant.product.thumbnail.url}
						alt={variant.product.thumbnail?.alt ?? ""}
						priority={priority}
						width={140}  // intrinsic width
						height={40}  // intrinsic height
						className="w-[70px] h-[20px]" // rendered size
					  />
					)}
					<span className="text-gray-700 text-sm font-medium">{company ?? "Compagnie inconnue"}</span>
				</div>

				{/* Times row */}
				<div className="flex items-center gap-6">
					<div className="text-center">
						<div className="text-lg font-semibold text-[#97D700]">
							{departureTimeStr}
						</div>
						<div className="text-xs text-gray-600 mt-1">
							{/* {origin ?? "Ville de départ"} */}
							{departureStation ? `${departureStation}` : ""}
						</div>
					</div>

					<div className="flex flex-col items-center text-gray-400">
						<div className="text-lg font-semibold">→</div>
						{readableDuration && (
							<div className="text-xs text-gray-500 mt-1">{readableDuration}</div>
						)}
					</div>

					<div className="text-center">
						<div className="text-lg font-semibold text-[#97D700]">
							{arrivalTimeStr ?? "— —"}
						</div>
						<div className="text-xs text-gray-600 mt-1">
							{/* {destination ?? "Ville d’arrivée"} */}
							{arrivalStation ? `${arrivalStation}` : ""}
						</div>
					</div>
				</div>
			</div>

			{/* RIGHT SIDE: price & action */}
			<div className="text-right mt-4 md:mt-0">
				<div className="text-xl font-bold text-[#d13b3b]">
					{formatMoney(
						variant?.pricing?.price?.gross.amount ?? 0,
						variant?.pricing?.price?.gross.currency ?? ""
					)}
				</div>
				<button className="mt-2 bg-[#97D700] text-white font-semibold py-2 px-4 rounded-md text-sm hover:bg-green-700 transition">
					Sélectionner
				</button>
			</div>
		</div>
	);
}
