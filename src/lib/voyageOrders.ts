import dayjs from "dayjs";
import "dayjs/locale/fr";
import { PLATFORM_FEE_PRODUCT_SLUG } from "@/lib/ensurePlatformFeeInCheckout";
import { getTripInformation } from "@/lib/attribute";
import { formatCheckoutMoney } from "@/checkout/lib/checkoutPricing";
import { getBookingBadge } from "@/lib/bookingStatus";

dayjs.locale("fr");

export type VoyageOrderLine = {
	id?: string | null;
	quantity?: number | null;
	totalPrice?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
	unitPrice?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
	variant?: {
		id?: string | null;
		name?: string | null;
		metadata?: Array<{ key?: string | null; value?: string | null }> | null;
		attributes?: Parameters<typeof getTripInformation>[0]["attributes"];
		product?: {
			slug?: string | null;
			name?: string | null;
			thumbnail?: { url?: string | null; alt?: string | null } | null;
		} | null;
		pricing?: {
			price?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
		} | null;
	} | null;
} | null;

export type VoyageOrder = {
	id: string;
	number?: string | null;
	created?: string | null;
	status?: string | null;
	isPaid?: boolean | null;
	customerNote?: string | null;
	paymentStatus?: string | null;
	paymentStatusDisplay?: string | null;
	authorizeStatus?: string | null;
	chargeStatus?: string | null;
	metadata?: Array<{ key?: string | null; value?: string | null }> | null;
	fulfillments?: Array<{ id?: string | null; status?: string | null }> | null;
	billingAddress?: { phone?: string | null } | null;
	total?: { gross?: { amount?: number | null; currency?: string | null } | null } | null;
	lines: VoyageOrderLine[];
};

const ARCHIVE_FALLBACK_DURATION_MINUTES = 12 * 60;

export function isPlatformFeeLine(line: VoyageOrderLine): boolean {
	const slug = (line?.variant?.product?.slug || "").toLowerCase();
	const name = (line?.variant?.product?.name || "").toLowerCase();
	if (slug === PLATFORM_FEE_PRODUCT_SLUG) return true;
	if (slug.includes("platform-fee") || slug.includes("platform_fee")) return true;
	if (name.includes("platform fee") || name.includes("frais de service") || name.includes("frais chapchap")) {
		return true;
	}
	return false;
}

export function getTicketLines(order: VoyageOrder): NonNullable<VoyageOrderLine>[] {
	return (order.lines ?? []).filter(
		(l): l is NonNullable<VoyageOrderLine> => !!l && !!l.variant && !isPlatformFeeLine(l),
	);
}

export function getPrimaryTicketLine(order: VoyageOrder): NonNullable<VoyageOrderLine> | null {
	return getTicketLines(order)[0] ?? null;
}

/** Prefer order.total; if 0/missing, sum line totals (or unit × qty). */
export function resolveOrderTotal(order: VoyageOrder): { amount: number; currency: string } {
	const currency =
		order.total?.gross?.currency ||
		order.lines.find((l) => l?.totalPrice?.gross?.currency)?.totalPrice?.gross?.currency ||
		order.lines.find((l) => l?.unitPrice?.gross?.currency)?.unitPrice?.gross?.currency ||
		order.lines.find((l) => l?.variant?.pricing?.price?.gross?.currency)?.variant?.pricing?.price
			?.gross?.currency ||
		"XOF";

	const reported = order.total?.gross?.amount;
	if (typeof reported === "number" && Number.isFinite(reported) && reported > 0) {
		return { amount: reported, currency };
	}

	let sum = 0;
	for (const line of order.lines ?? []) {
		if (!line) continue;
		const qty = line.quantity || 1;
		const lineTotal = line.totalPrice?.gross?.amount;
		if (typeof lineTotal === "number" && Number.isFinite(lineTotal) && lineTotal > 0) {
			sum += lineTotal;
			continue;
		}
		const unit =
			line.unitPrice?.gross?.amount ??
			line.variant?.pricing?.price?.gross?.amount ??
			0;
		if (typeof unit === "number" && Number.isFinite(unit) && unit > 0) {
			sum += unit * qty;
		}
	}

	return { amount: sum, currency };
}

export function formatVoyageMoney(amount: number, currency: string): string {
	return formatCheckoutMoney(amount, currency);
}

export function parsePassengerNames(input: {
	metadata?: Array<{ key?: string | null; value?: string | null }> | null;
	customerNote?: string | null;
}): string[] {
	const meta = (input.metadata ?? []).find(
		(m) => (m.key ?? "").trim().toLowerCase() === "passengers",
	);
	if (meta?.value) {
		try {
			const parsed = JSON.parse(meta.value);
			if (Array.isArray(parsed)) {
				const names = parsed
					.map((p) => {
						if (!p || typeof p !== "object") return "";
						const first = String((p as { firstName?: unknown }).firstName ?? "").trim();
						const last = String((p as { lastName?: unknown }).lastName ?? "").trim();
						return `${first} ${last}`.trim();
					})
					.filter(Boolean);
				if (names.length) return names;
			}
		} catch {
			/* fall through */
		}
	}

	const note = input.customerNote?.trim();
	if (!note) return [];
	return note
		.split(";")
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const [lastName, firstName] = block.split(",").map((p) => p.trim());
			return `${firstName || ""} ${lastName || ""}`.trim();
		})
		.filter(Boolean);
}

export type PaymentBadge = {
	label: string;
	tone: "confirmed" | "pending" | "cancelled" | "neutral" | "awaiting";
	className: string;
};

/** @deprecated Prefer getBookingBadge from @/lib/bookingStatus */
export function getPaymentBadge(order: VoyageOrder): PaymentBadge {
	const total = resolveOrderTotal(order);
	const badge = getBookingBadge({
		orderStatus: order.status,
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		metadata: order.metadata,
		fulfillments: order.fulfillments,
		paidAmountLabel: formatVoyageMoney(total.amount, total.currency),
	});
	const tone: PaymentBadge["tone"] =
		badge.phase === "issued" || badge.phase === "boarded"
			? "confirmed"
			: badge.phase === "awaiting_guichet"
				? "awaiting"
				: badge.phase === "pending_payment" || badge.phase === "refund_pending"
					? "pending"
					: badge.phase === "cancelled" || badge.phase === "rejected"
						? "cancelled"
						: "neutral";
	return { label: badge.label, tone, className: badge.className };
}

export function formatLongFrenchDate(d: Date | null | undefined): string {
	if (!d || Number.isNaN(d.getTime())) return "—";
	const raw = dayjs(d).locale("fr").format("dddd D MMMM YYYY");
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Period of day label for departure time (CI-friendly). */
export function periodOfDayLabel(departureDate: Date | null | undefined): string {
	if (!departureDate || Number.isNaN(departureDate.getTime())) return "";
	const h = departureDate.getHours();
	if (h < 12) return "Matin";
	if (h < 17) return "Milieu de journée";
	return "Soir";
}

export function isVoyageHistorique(order: VoyageOrder, now = new Date()): boolean {
	const status = (order.status ?? "").toUpperCase();
	if (status === "CANCELED" || status === "CANCELLED" || status === "RETURNED") return true;

	const line = getPrimaryTicketLine(order);
	const attributes = line?.variant?.attributes || [];
	const { departureDate, durationMinutes } = getTripInformation({ attributes: attributes as never });
	if (!departureDate) {
		// No trip date: treat older unpaid / fulfilled as historique
		const created = order.created ? new Date(order.created) : null;
		if (created && now.getTime() - created.getTime() > 7 * 24 * 60 * 60_000) return true;
		return false;
	}
	const duration =
		durationMinutes && durationMinutes > 0 ? durationMinutes : ARCHIVE_FALLBACK_DURATION_MINUTES;
	return now.getTime() > departureDate.getTime() + duration * 60_000;
}

export function getTravelDate(order: VoyageOrder): Date {
	const line = getPrimaryTicketLine(order);
	const attributes = line?.variant?.attributes || [];
	const { departureDate } = getTripInformation({ attributes: attributes as never });
	return departureDate || (order.created ? new Date(order.created) : new Date(0));
}

export function paymentMethodLabel(order: VoyageOrder): string | null {
	for (const m of order.metadata ?? []) {
		const key = (m.key ?? "").toLowerCase();
		if (key === "payment_method" || key === "payment_provider" || key === "momo_provider") {
			const v = (m.value ?? "").trim();
			if (!v) continue;
			const lower = v.toLowerCase();
			if (lower.includes("wave")) return "Wave";
			if (lower.includes("orange")) return "Orange Money";
			if (lower.includes("mtn")) return "MTN MoMo";
			if (lower.includes("moov")) return "Moov Money";
			return v;
		}
	}
	return null;
}
