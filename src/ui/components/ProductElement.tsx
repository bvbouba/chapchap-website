"use client";

import { formatMoney } from "@/lib/utils";
import { ProductImageWrapper } from "../atoms/ProductImageWrapper";
import { AddButton } from "./AddButton";
import { ProductVariantListItemFragment } from "@/gql/graphql";
import { addToCartAction } from "@/actions/addToCart";
import { useParams, useRouter } from "next/navigation";
import { useGlobalLoading } from "@/context/GlobalLoadingContext";
import { useTripSearch } from "@/context/TripSearchContext";
import { useProgress } from "@/context/ProgressContext";
import { Arrow, BusIcon } from "./Svg";
import { useTransition } from "react";

export function ProductElement({
	variant,
	priority,
}: {
	variant: ProductVariantListItemFragment;
	loading: "eager" | "lazy";
	priority?: boolean;
}) {
	const attributes = variant.attributes || [];
	const params = useParams<{ channel: string }>();
	const router = useRouter();
	const { setLoading } = useGlobalLoading();
	const { setData, data } = useTripSearch();
	const { setStep } = useProgress();
	const [isPending, startTransition] = useTransition();
	
	const handleAddToCart = async () => {
        try {
			// 1. Show the Global Overlay immediately
			setLoading(true, variant.product.thumbnail ?? undefined);
            // We keep your global loading if you want, but isPending is better for the button
            const res = await addToCartAction({
                channel: params.channel,
                variantId: variant.id,
            });

            // 3. Wrap all state/navigation logic in startTransition
            startTransition(() => {
                if (data?.tripType === "oneway") {
                    setStep("summary");
                    router.push(`/${params.channel}/cart`);
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
					// Turn off overlay ONLY if staying on the same page
					setLoading(false);
                    // Note: If you stay on the page, isPending will end after state updates
                } else if (data?.tripType === "roundtrip" && res?.checkout?.lines.length === 2) {
                    setStep("summary");
                    router.push(`/${params.channel}/cart`);
                }
            });
        } catch (error) {
			console.error("Erreur:", error);
            setLoading(false); // Hide on error
        }
		// Note: We DON'T setLoading(false) in 'finally' if we are navigating,
        // because the new page will unmount this component anyway.
    };

	// Helper: get attribute value (name or value)
	const getAttrValue = (attrs: typeof attributes, slug: string): string | undefined => {
		const found = attrs.find((attr) => attr.attribute?.slug === slug);
		return found?.values?.[0]?.name ?? found?.values?.[0]?.value ?? undefined;
	};

	// Parse duration string into total minutes
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
			const h = parseInt(colonMatch[1], 10);
			const m = parseInt(colonMatch[2], 10);
			return h * 60 + m;
		}
		const numMatch = s.match(/(\d+)/);
		if (numMatch) return parseInt(numMatch[1], 10);
		return 0;
	};

	const formatMinutes = (mins: number): string | null => {
		if (!mins || mins <= 0) return null;
		const h = Math.floor(mins / 60);
		const m = mins % 60;
		if (h === 0) return `${m}min`;
		return `${h}h ${m.toString().padStart(2, "0")}m`;
	};

	const durationRaw = getAttrValue(attributes, "estimated-duration");
	const company = getAttrValue(attributes, "bus-operator");
	const departureStation = getAttrValue(attributes, "departure-station");
	const arrivalStation = getAttrValue(attributes, "arrival-station");
	const dateTime = getAttrValue(attributes, "departure-time");

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
		const arrivalMs = departureDate.getTime() + durationMinutes * 60_000;
		const arrivalDate = new Date(arrivalMs);
		arrivalTimeStr = formatTimeUTC(arrivalDate);
	}

	const departureTimeStr = departureDate ? formatTimeUTC(departureDate) : "— —";

	return (
		<div className="relative">
			{/* Product Card */}
			<div
				key={variant.id}
				className="flex flex-col items-start justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md md:flex-row md:items-center"
			>
				{/* LEFT SIDE: company + times */}
				<div className="flex flex-col">
					<div className="mb-3 flex items-center gap-2">
						{variant.product.thumbnail?.url && (
							<ProductImageWrapper
								src={variant.product.thumbnail.url}
								alt={variant.product.thumbnail?.alt ?? ""}
								priority={priority}
								width={140}
								height={40}
								className="h-[20px] w-[70px]"
							/>
						)}
						<span className="text-sm text-gray-700  ">{company ?? "Compagnie inconnue"}</span>
					</div>

					{/* Times */}
					<div className="flex items-center gap-6">
						<span>
							<BusIcon />
						</span>
						<div className="text-center">
							<div className="text-lg text-xl font-semibold">{departureTimeStr}</div>
							<div className="mt-1 text-xs text-gray-600">{departureStation?.split(",")[0] ?? ""}</div>
						</div>

						<div className="relative flex w-32 items-center justify-center text-gray-400">
							<Arrow />
							<span className="absolute bg-white px-1 text-xs italic text-gray-500">{readableDuration}</span>
						</div>

						<div className="text-center">
							<div className="text-lg text-xl font-semibold">{arrivalTimeStr ?? "— —"}</div>
							<div className="mt-1 text-xs text-gray-600">{arrivalStation?.split(",")[0] ?? ""}</div>
						</div>
					</div>
				</div>

				{/* RIGHT SIDE: price & action */}
				<div className="mt-4 text-right md:mt-0">
					<div className="text-xl font-semibold">
						{formatMoney(
							variant?.pricing?.price?.gross.amount ?? 0,
							variant?.pricing?.price?.gross.currency ?? "",
						)}
					</div>
					<AddButton disabled={!variant?.quantityAvailable} addItem={handleAddToCart} isNavigating={isPending}/>
				</div>
			</div>
		</div>
	);
}
