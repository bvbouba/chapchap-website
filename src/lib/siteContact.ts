/** Public ChapChap support contacts (override via env). */

export const SITE_SUPPORT = {
	phoneDisplay:
		process.env.NEXT_PUBLIC_SUPPORT_PHONE?.trim() || "+225 07 00 00 00 00",
	/** Digits only for tel: / wa.me links */
	phoneE164:
		(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || process.env.NEXT_PUBLIC_SUPPORT_PHONE || "2250700000000")
			.replace(/\D/g, "")
			.replace(/^0/, "225") || "2250700000000",
	hoursLabel: "Du lundi au dimanche (7h – 20h)",
} as const;

export function whatsappChatUrl(prefill?: string): string {
	const text = prefill?.trim()
		? `?text=${encodeURIComponent(prefill.trim())}`
		: "";
	return `https://wa.me/${SITE_SUPPORT.phoneE164}${text}`;
}

export function telHref(): string {
	return `tel:+${SITE_SUPPORT.phoneE164}`;
}
