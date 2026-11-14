import { PLATFORM_FEE_PRODUCT_SLUG } from "@/lib/ensurePlatformFeeInCheckout";

type ProductLike = {
	slug?: string | null;
	name?: string | null;
} | null;

type LineLike = {
	quantity?: number | null;
	totalPrice?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
	unitPrice?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
	variant?: { product?: ProductLike } | null;
} | null;

export function isCheckoutPlatformFeeLine(line: LineLike): boolean {
	const slug = (line?.variant?.product?.slug || "").toLowerCase();
	const name = (line?.variant?.product?.name || "").toLowerCase();
	if (slug === PLATFORM_FEE_PRODUCT_SLUG) return true;
	if (slug.includes("platform-fee") || slug.includes("platform_fee")) return true;
	if (name.includes("platform fee") || name.includes("frais de service") || name.includes("frais chapchap")) {
		return true;
	}
	return false;
}

export function getCheckoutTripLines<T extends LineLike>(lines: T[] | null | undefined): NonNullable<T>[] {
	return (lines ?? []).filter((l): l is NonNullable<T> => !!l && !isCheckoutPlatformFeeLine(l));
}

export function getCheckoutFeeLine<T extends LineLike>(lines: T[] | null | undefined): NonNullable<T> | null {
	return (lines ?? []).find((l): l is NonNullable<T> => !!l && isCheckoutPlatformFeeLine(l)) ?? null;
}

export function formatCheckoutMoney(amount?: number | null, currency?: string | null): string {
	if (amount == null || !Number.isFinite(amount)) return "—";
	const cur = (currency || "XOF").toUpperCase() === "XOF" ? "FCFA" : currency || "";
	return `${Math.round(amount).toLocaleString("fr-FR")} ${cur}`.trim();
}

export function summarizeCheckoutPricing(lines: LineLike[] | null | undefined, totalAmount?: number | null) {
	const tripLines = getCheckoutTripLines(lines);
	const feeLine = getCheckoutFeeLine(lines);
	const passengerCount = tripLines.reduce((acc, l) => acc + (l.quantity || 0), 0) || 1;
	const ticketAmount = tripLines.reduce((acc, l) => acc + (l.totalPrice?.gross?.amount ?? 0), 0);
	const feeAmount = feeLine?.totalPrice?.gross?.amount ?? 0;
	const currency =
		tripLines[0]?.totalPrice?.gross?.currency ||
		feeLine?.totalPrice?.gross?.currency ||
		"XOF";
	const unitAmount =
		passengerCount > 0
			? ticketAmount / passengerCount
			: tripLines[0]?.unitPrice?.gross?.amount ?? 0;
	const total = totalAmount ?? ticketAmount + feeAmount;

	return {
		tripLines,
		feeLine,
		passengerCount,
		ticketAmount,
		feeAmount,
		unitAmount,
		currency,
		total,
	};
}
