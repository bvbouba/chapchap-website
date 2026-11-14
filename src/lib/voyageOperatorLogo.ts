import { getOperatorChannelSlug } from "@/lib/attribute";
import { loadOperatorLogoMap } from "@/lib/loadOperatorLogoMap";
import {
	getPrimaryTicketLine,
	type VoyageOrder,
} from "@/lib/voyageOrders";

/**
 * Resolve operator logo URL for a voyage order:
 * 1) channel / category company metadata
 * 2) product thumbnail on the ticket line
 */
export async function resolveVoyageOperatorLogo(order: VoyageOrder): Promise<string> {
	const line = getPrimaryTicketLine(order);
	const attributes = line?.variant?.attributes;
	const slug = getOperatorChannelSlug(attributes as never);
	const productThumb = line?.variant?.product?.thumbnail?.url?.trim() || "";

	if (slug) {
		try {
			const map = await loadOperatorLogoMap();
			const fromChannel = map[slug]?.trim();
			if (fromChannel) return fromChannel;
		} catch (err) {
			console.error("resolveVoyageOperatorLogo failed:", err);
		}
	}

	return productThumb;
}

/** Batch-resolve logos for a list of orders (one channel map fetch). */
export async function resolveVoyageOperatorLogos(
	orders: VoyageOrder[],
): Promise<Record<string, string>> {
	const logos: Record<string, string> = {};
	let map: Record<string, string> = {};
	try {
		map = await loadOperatorLogoMap();
	} catch (err) {
		console.error("resolveVoyageOperatorLogos map failed:", err);
	}

	for (const order of orders) {
		const line = getPrimaryTicketLine(order);
		const attributes = line?.variant?.attributes;
		const slug = getOperatorChannelSlug(attributes as never);
		const fromChannel = slug ? map[slug]?.trim() : "";
		const productThumb = line?.variant?.product?.thumbnail?.url?.trim() || "";
		logos[order.id] = fromChannel || productThumb || "";
	}

	return logos;
}
