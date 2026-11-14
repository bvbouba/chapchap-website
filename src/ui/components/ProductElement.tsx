"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	Cable,
	ChevronDown,
	ChevronUp,
	Info,
	Snowflake,
	Tv,
	Wifi,
	Bus,
	CheckCircle2,
	Luggage,
} from "lucide-react";
import { ProductImageWrapper } from "../atoms/ProductImageWrapper";
import { AddButton } from "./AddButton";
import { formatMoney } from "@/lib/utils";
import { getOperatorChannelSlug } from "@/lib/attribute";
import { type OperatorCardMetaMap } from "@/lib/loadOperatorLogoMap";
import { type ProductVariantListItemFragment } from "@/gql/graphql";
import { addToCartAction } from "@/actions/addToCart";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";
import { useTripSearch } from "@/context/TripSearchContext";
import { useProgress } from "@/context/ProgressContext";

/** Same as customer mobile `colors.green` / website `brand.green`. */
const BRAND_GREEN = "#A6C65A";

function AmenityIcon({ slug }: { slug: string }) {
	const s = slug.toLowerCase();
	if (s.includes("wi-fi") || s.includes("wifi")) return <Wifi className="h-3.5 w-3.5" aria-hidden />;
	if (s.includes("climat") || s.includes("ac") || s.includes("air")) {
		return <Snowflake className="h-3.5 w-3.5" aria-hidden />;
	}
	if (s.includes("usb") || s.includes("prise")) return <Cable className="h-3.5 w-3.5" aria-hidden />;
	if (s.includes("toilet") || s.includes("toillet")) {
		return <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />;
	}
	if (s.includes("tv") || s.includes("tele")) return <Tv className="h-3.5 w-3.5" aria-hidden />;
	if (s.includes("bagage")) return <Luggage className="h-3.5 w-3.5" aria-hidden />;
	return <Bus className="h-3.5 w-3.5" aria-hidden />;
}

function parseNumericAttr(raw?: string | null): number | null {
	if (!raw) return null;
	const match = raw.replace(",", ".").match(/-?\d+(\.\d+)?/);
	if (!match) return null;
	const n = Number(match[0]);
	return Number.isFinite(n) ? n : null;
}

function getProductAttrRaw(
	variant: ProductVariantListItemFragment,
	slug: string,
): string | undefined {
	const found = variant.product?.attributes?.find(
		(attr) => (attr.attribute?.slug || "").toLowerCase() === slug.toLowerCase(),
	);
	const v = found?.values?.[0];
	for (const c of [v?.name, v?.value, v?.slug]) {
		const s = c?.toString().trim();
		if (s) return s;
	}
	return undefined;
}

export function ProductElement({
	variant,
	priority,
	operatorMeta = {},
}: {
	variant: ProductVariantListItemFragment;
	loading: "eager" | "lazy";
	priority?: boolean;
	operatorMeta?: OperatorCardMetaMap;
}) {
	const attributes = variant.attributes || [];
	const params = useParams<{ channel: string }>();
	const router = useRouter();
	const { setLoading } = useGlobalLoading();
	const { setData, data } = useTripSearch();
	const { setStep } = useProgress();
	const [isPending, startTransition] = useTransition();
	const [detailsOpen, setDetailsOpen] = useState(false);

	const getAttrValue = (attrs: typeof attributes, slug: string): string | undefined => {
		const found = attrs.find((attr) => attr.attribute?.slug === slug);
		return found?.values?.[0]?.name ?? found?.values?.[0]?.value ?? undefined;
	};

	const getAttrValues = (slug: string) => {
		const found = attributes.find((attr) => attr.attribute?.slug === slug);
		return found?.values ?? [];
	};

	const durationRaw = getAttrValue(attributes, "estimated-duration");
	const company =
		getAttrValue(attributes, "bus-operator") || variant.product.name || "Compagnie";
	const operatorSlug = getOperatorChannelSlug(attributes);
	const departureStation = getAttrValue(attributes, "departure-station");
	const arrivalStation = getAttrValue(attributes, "arrival-station");
	const dateTime = getAttrValue(attributes, "departure-time");
	const amenities = getAttrValues("amenities").filter((a) => (a?.name || a?.slug || "").trim());

	const operatorCard = operatorSlug ? operatorMeta[operatorSlug] : undefined;
	const operatorLogoUrl = operatorCard?.logoUrl?.trim() || "";
	const channelProductLogoUrl = variant.product.thumbnail?.url?.trim() || "";
	const logoUrl = operatorLogoUrl || channelProductLogoUrl;

	const parseDurationToMinutes = (raw?: string): number => {
		if (!raw) return 0;
		const s = raw.trim().toLowerCase();
		if (/^\d+$/.test(s)) return parseInt(s, 10);
		const minMatch = s.match(/^(\d+)\s*min(?:ute)?s?$/);
		if (minMatch) return parseInt(minMatch[1], 10);
		const hmMatch = s.match(/(\d+)\s*h(?:ours?)?\s*(\d+)?/);
		if (hmMatch) {
			const h = parseInt(hmMatch[1], 10);
			const m = hmMatch[2] ? parseInt(hmMatch[2], 10) : 0;
			return h * 60 + m;
		}
		const colonMatch = s.match(/^(\d{1,2}):(\d{2})$/);
		if (colonMatch) {
			return parseInt(colonMatch[1], 10) * 60 + parseInt(colonMatch[2], 10);
		}
		const numMatch = s.match(/(\d+)/);
		return numMatch ? parseInt(numMatch[1], 10) : 0;
	};

	const formatMinutes = (mins: number): string | null => {
		if (!mins || mins <= 0) return null;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		if (h === 0) return `${m}min`;
		return `${h}h ${m.toString().padStart(2, "0")}m`;
	};

	const departureDate = dateTime ? new Date(dateTime) : null;
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
		arrivalTimeStr = formatTimeUTC(new Date(departureDate.getTime() + durationMinutes * 60_000));
	}

	const departureTimeStr = departureDate ? formatTimeUTC(departureDate) : "— —";
	const seats = variant.quantityAvailable;
	const lowSeats = typeof seats === "number" && seats > 0 && seats <= 4;
	const priceAmount = variant?.pricing?.price?.gross.amount ?? 0;
	const priceCurrency = variant?.pricing?.price?.gross.currency ?? "";
	const priceLabel = formatMoney(priceAmount, priceCurrency);

	// Prefer channel metadata (bagages_allowed / cancellation_hours), then legacy product attrs.
	const bagagesIncluded =
		parseNumericAttr(operatorCard?.bagagesAllowed) ??
		parseNumericAttr(getProductAttrRaw(variant, "bagages"));
	const cancellationHours =
		parseNumericAttr(operatorCard?.cancellationHours) ??
		parseNumericAttr(getProductAttrRaw(variant, "cancellation"));
	const cancellationText =
		cancellationHours == null
			? null
			: cancellationHours <= 0
				? "Aucune annulation possible pour ce trajet."
				: `Annulation gratuite jusqu'à ${Math.round(cancellationHours)}h avant le départ (Avoir).`;

	const destinationLabel =
		data?.destination?.name || arrivalStation?.split(",")[0] || arrivalStation || "";

	const handleAddToCart = async () => {
		const marketplaceChannel = Array.isArray(params.channel) ? params.channel[0] : params.channel;
		if (!marketplaceChannel) return;

		try {
			setLoading(true, {
				companyLogo: logoUrl ? { url: logoUrl, alt: company } : undefined,
				companyName: company,
				destination: destinationLabel,
			});

			const res = await addToCartAction({
				channel: marketplaceChannel,
				operatorChannelSlug: operatorSlug,
				variantId: variant.id,
			});

			const cartChannel = res?.checkoutChannel || operatorSlug || marketplaceChannel;

			startTransition(() => {
				if (data?.tripType === "oneway") {
					setStep("summary");
					router.push(`/${cartChannel}/cart`);
				} else if (data?.tripType === "roundtrip" && res?.checkout?.lines.length === 1) {
					setData({
						...data,
						query: {
							origin: data.destination.slug,
							destination: data.origin.slug,
							date: data.returnDate ?? "",
						},
					});
					setStep("return");
					setLoading(false);
				} else if (data?.tripType === "roundtrip" && res?.checkout?.lines.length === 2) {
					setStep("summary");
					router.push(`/${cartChannel}/cart`);
				} else {
					setStep("summary");
					router.push(`/${cartChannel}/cart`);
				}
			});
		} catch (error) {
			console.error("Erreur:", error);
			setLoading(false);
		}
	};

	return (
		<article className="rounded-2xl border border-[#E8E9EC] bg-white p-4 shadow-sm transition hover:border-[#D5D6DB] hover:shadow-md sm:p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					{logoUrl ? (
						<div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#E8E9EC] bg-white">
							<ProductImageWrapper
								src={logoUrl}
								alt={company}
								priority={priority}
								width={80}
								height={80}
								className="h-10 w-10 bg-white object-contain p-0.5"
								unoptimized
							/>
						</div>
					) : (
						<div
							className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold"
							style={{ backgroundColor: "#F1F7E4", color: BRAND_GREEN }}
						>
							{company.charAt(0).toUpperCase()}
						</div>
					)}
					<div className="min-w-0">
						<h3 className="truncate text-sm font-bold text-[#111111] sm:text-base">{company}</h3>
						{lowSeats ? (
							<p className="mt-0.5 text-xs font-semibold text-[#EB1700]">
								Plus que {seats} place{seats > 1 ? "s" : ""} disponible{seats > 1 ? "s" : ""} !
							</p>
						) : null}
					</div>
				</div>
				<div className="shrink-0 text-right">
					<div className="text-lg font-bold sm:text-xl" style={{ color: BRAND_GREEN }}>
						{priceLabel}
					</div>
					<p className="text-[11px] text-[#9CA3AF]">/ passager</p>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
				<div>
					<div className="text-xl font-bold tabular-nums text-[#111111] sm:text-2xl">
						{departureTimeStr}
					</div>
					<div className="mt-0.5 text-xs text-[#606060] sm:text-sm">
						{departureStation?.split(",")[0] || "Départ"}
					</div>
				</div>

				<div className="flex min-w-[5.5rem] flex-col items-center px-1 sm:min-w-[7rem]">
					<span className="mb-1 text-[11px] font-medium text-[#606060]">
						{readableDuration || "—"}
					</span>
					<div className="flex w-full items-center gap-1">
						<span className="h-2 w-2 shrink-0 rounded-full bg-[#EB1700]" aria-hidden />
						<span className="h-px flex-1 bg-[#D5D6DB]" aria-hidden />
						<span
							className="h-2 w-2 shrink-0 rounded-full border-2 bg-white"
							style={{ borderColor: BRAND_GREEN }}
							aria-hidden
						/>
					</div>
				</div>

				<div className="text-right">
					<div className="text-xl font-bold tabular-nums text-[#111111] sm:text-2xl">
						{arrivalTimeStr ?? "— —"}
					</div>
					<div className="mt-0.5 text-xs text-[#606060] sm:text-sm">
						{arrivalStation?.split(",")[0] || "Arrivée"}
					</div>
				</div>
			</div>

			{amenities.length > 0 ? (
				<ul className="mt-4 flex flex-wrap gap-1.5">
					{amenities.slice(0, 4).map((item, index) => {
						const label = (item.name || item.slug || "").trim();
						const slug = (item.slug || item.name || "").trim();
						return (
							<li
								key={`${slug}-${index}`}
								className="inline-flex items-center gap-1 rounded-full border border-[#E8E9EC] bg-[#F7F7F8] px-2.5 py-1 text-[11px] font-medium text-[#505050]"
							>
								<span style={{ color: BRAND_GREEN }}>
									<AmenityIcon slug={slug} />
								</span>
								{label}
							</li>
						);
					})}
				</ul>
			) : null}

			<div className="mt-4 flex items-center justify-between gap-3 border-t border-[#F0F1F3] pt-3">
				<button
					type="button"
					onClick={() => setDetailsOpen((v) => !v)}
					className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
					style={{ color: BRAND_GREEN }}
					aria-expanded={detailsOpen}
				>
					<Info className="h-4 w-4" aria-hidden />
					Détails
					{detailsOpen ? (
						<ChevronUp className="h-4 w-4" aria-hidden />
					) : (
						<ChevronDown className="h-4 w-4" aria-hidden />
					)}
				</button>
				<AddButton addItem={handleAddToCart} isNavigating={isPending} />
			</div>

			{detailsOpen ? (
				<div className="mt-4 space-y-4 rounded-xl border border-[#E8E9EC] bg-[#FAFAFA] p-4 text-sm">
					<div>
						<h4 className="font-bold text-[#111111]">Itinéraire</h4>
						<ul className="mt-2 space-y-2 text-[#505050]">
							<li>
								<span className="font-semibold text-[#111111]">{departureTimeStr}</span>
								{" — "}
								{departureStation || "Départ"}
							</li>
							<li className="text-xs text-[#9CA3AF]">
								Durée estimée : {readableDuration || "—"}
							</li>
							<li>
								<span className="font-semibold text-[#111111]">{arrivalTimeStr ?? "— —"}</span>
								{" — "}
								{arrivalStation || "Arrivée"}
							</li>
						</ul>
					</div>

					{(amenities.length > 0 || (bagagesIncluded != null && bagagesIncluded > 0)) && (
						<div>
							<h4 className="font-bold text-[#111111]">Services à bord & conditions</h4>
							<ul className="mt-2 flex flex-wrap gap-1.5">
								{amenities.map((item, index) => {
									const label = (item.name || item.slug || "").trim();
									const slug = (item.slug || item.name || "").trim();
									if (!label) return null;
									return (
										<li
											key={`d-${slug}-${index}`}
											className="inline-flex items-center gap-1 rounded-full border border-[#E8E9EC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#505050]"
										>
											<span style={{ color: BRAND_GREEN }}>
												<AmenityIcon slug={slug} />
											</span>
											{label}
										</li>
									);
								})}
								{bagagesIncluded != null && bagagesIncluded > 0 ? (
									<li className="inline-flex items-center gap-1 rounded-full border border-[#E8E9EC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#505050]">
										<span style={{ color: BRAND_GREEN }}>
											<Luggage className="h-3.5 w-3.5" aria-hidden />
										</span>
										{bagagesIncluded} bagage{bagagesIncluded > 1 ? "s" : ""} inclus
									</li>
								) : null}
							</ul>
						</div>
					)}

					{cancellationText ? (
						<div>
							<h4 className="font-bold text-[#111111]">Politique d&apos;annulation</h4>
							<p className="mt-1 text-[#505050]">{cancellationText}</p>
						</div>
					) : null}

					<p className="text-xs text-[#9CA3AF]">
						{priceLabel} / passager · {company}
					</p>
				</div>
			) : null}
		</article>
	);
}
