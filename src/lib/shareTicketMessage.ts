/**
 * Builds a WhatsApp-friendly ticket message (no Business API — free native share).
 */

export type TicketShareInput = {
	orderId: string;
	orderNumber?: string | null;
	confirmationCode: string;
	departureCity?: string | null;
	arrivalCity?: string | null;
	departureDateLabel?: string | null;
	departureTimeStr?: string | null;
	company?: string | null;
	passengers?: string[];
	/** Absolute URL to the order details page (preferred). */
	orderUrl?: string | null;
};

export function buildTicketShareMessage(input: TicketShareInput): string {
	const route =
		input.departureCity && input.arrivalCity
			? `${input.departureCity} ➔ ${input.arrivalCity}`
			: null;
	const dateLine = (() => {
		if (input.departureDateLabel && input.departureTimeStr) {
			return `${input.departureDateLabel} à ${input.departureTimeStr}`;
		}
		if (input.departureDateLabel) return input.departureDateLabel;
		if (input.departureTimeStr) return input.departureTimeStr;
		return null;
	})();
	const passengers =
		input.passengers && input.passengers.length > 0
			? input.passengers.join(", ")
			: null;

	const lines = [
		"🚌 Voici ton billet de car ChapChap Tickets !",
		"",
		route ? `• Trajet : ${route}` : null,
		dateLine ? `• Date : ${dateLine}` : null,
		input.company ? `• Compagnie : ${input.company}` : null,
		passengers ? `• Passager : ${passengers}` : null,
		`• N° Réservation : #${input.orderNumber || input.confirmationCode}`,
		`• Code : ${input.confirmationCode}`,
	];

	if (input.orderUrl) {
		lines.push("", "📱 Voir le billet / QR :", input.orderUrl);
	}

	return lines.filter((line) => line !== null).join("\n");
}

export function whatsappShareHref(message: string): string {
	return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

/** Prefer Web Share API; fall back to opening WhatsApp. */
export async function shareTicketOnWeb(message: string): Promise<void> {
	if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
		try {
			await navigator.share({
				title: "Billet ChapChap Tickets",
				text: message,
			});
			return;
		} catch (err) {
			// AbortError = user cancelled
			if (err instanceof DOMException && err.name === "AbortError") return;
		}
	}
	window.open(whatsappShareHref(message), "_blank", "noopener,noreferrer");
}
