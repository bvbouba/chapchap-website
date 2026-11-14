/**
 * Human-facing confirmation code shown on customer tickets.
 * Same algorithm as the customer mobile / operators apps.
 */
export const CONFIRMATION_CODE_KEY = "confirmation_code";

export const generateShortCode = (saleorId: string): string => {
	let hash = 0;
	for (let i = 0; i < saleorId.length; i++) {
		const char = saleorId.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash).toString(36).toUpperCase().substring(0, 5);
};

/** Prefer stored metadata; fall back to hashing the order id. */
export function getConfirmationCode(order: {
	id: string;
	number?: string | null;
	metadata?: Array<{ key?: string | null; value?: string | null }> | null;
}): string {
	for (const m of order.metadata ?? []) {
		if ((m.key ?? "").trim().toLowerCase() === CONFIRMATION_CODE_KEY) {
			const v = (m.value ?? "").trim().toUpperCase();
			if (v) return v;
		}
	}
	return generateShortCode(order.id);
}
