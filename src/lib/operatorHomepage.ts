import { formatMinutes, parseDurationToMinutes } from "@/lib/attribute";

type AttrRow = {
	attribute?: { slug?: string | null } | null;
	values?: Array<{
		id?: string | null;
		name?: string | null;
		slug?: string | null;
		value?: string | null;
	} | null> | null;
};

export type OperatorRouteRow = {
	productId: string;
	productName: string;
	productSlug: string;
	label: string;
	durationLabel: string | null;
	priceAmount: number | null;
	currency: string;
	originSlug: string | null;
	originId: string | null;
	destinationSlug: string | null;
	destinationId: string | null;
};

const PLATFORM_FEE_PRODUCT_SLUG = "platform-fee";

function matchesPlatformFeeText(raw: string): boolean {
	const haystack = raw.toLowerCase().trim();
	if (!haystack) return false;
	return (
		haystack === PLATFORM_FEE_PRODUCT_SLUG ||
		haystack.includes("platform-fee") ||
		haystack.includes("platform fee") ||
		haystack.includes("platform_fee") ||
		haystack.includes("service fee") ||
		haystack.includes("service-fee") ||
		haystack.includes("service_fee") ||
		haystack.includes("frais de plateforme") ||
		haystack.includes("frais plateforme") ||
		haystack.includes("frais de service") ||
		haystack.includes("chapticket fee") ||
		haystack.includes("chapchap fee")
	);
}

export function isPlatformFeeProduct(product: {
	slug?: string | null;
	name?: string | null;
}): boolean {
	if (matchesPlatformFeeText(product.slug ?? "")) return true;
	return matchesPlatformFeeText(product.name ?? "");
}

function attrDisplay(
	attrs: AttrRow[] | null | undefined,
	slug: string,
): string | undefined {
	const found = (attrs ?? []).find((a) => a.attribute?.slug === slug);
	const v = found?.values?.[0];
	return v?.name ?? v?.value ?? undefined;
}

function firstAttr(
	productAttrs: AttrRow[] | null | undefined,
	variantAttrs: AttrRow[] | null | undefined,
	slug: string,
): string | undefined {
	return attrDisplay(variantAttrs, slug) || attrDisplay(productAttrs, slug);
}

function firstAttrValue(
	productAttrs: AttrRow[] | null | undefined,
	variantAttrs: AttrRow[] | null | undefined,
	slug: string,
): { name?: string | null; slug?: string | null; id?: string | null } | null {
	const rows = [...(variantAttrs ?? []), ...(productAttrs ?? [])];
	const found = rows.find((a) => a.attribute?.slug === slug);
	return found?.values?.[0] ?? null;
}

/** Parse "Origin → Destination" or "Operator: Origin → Destination" from product name. */
export function parseRouteLabel(productName: string): string {
	const trimmed = productName.trim();
	const colon = trimmed.indexOf(":");
	if (colon > 0 && trimmed.includes("→")) {
		return trimmed.slice(colon + 1).trim() || trimmed;
	}
	return trimmed;
}

/**
 * Bare numeric estimated-duration is stored in minutes (ligne create).
 * parseDurationToMinutes already treats plain digits as minutes.
 */
export function durationLabelFromRaw(durationRaw: string | undefined): string | null {
	if (!durationRaw?.trim()) return null;
	return formatMinutes(parseDurationToMinutes(durationRaw));
}

export function mapOperatorProducts(
	edges: Array<{
		node: {
			id: string;
			name: string;
			slug: string;
			pricing?: {
				priceRange?: {
					start?: { gross?: { amount: number; currency: string } | null } | null;
				} | null;
			} | null;
			attributes?: AttrRow[] | null;
			defaultVariant?: { attributes?: AttrRow[] | null } | null;
		};
	}> | null | undefined,
): {
	routes: OperatorRouteRow[];
	stations: string[];
	/** Legacy product attrs — used only when channel metadata is unavailable. */
	bagages: string | null;
	cancellation: string | null;
} {
	const routes: OperatorRouteRow[] = [];
	const stationSet = new Map<string, string>();
	let bagages: string | null = null;
	let cancellation: string | null = null;

	for (const edge of edges ?? []) {
		const p = edge.node;
		if (isPlatformFeeProduct({ slug: p.slug, name: p.name })) continue;

		const productAttrs = p.attributes ?? [];
		const variantAttrs = p.defaultVariant?.attributes ?? [];

		const durationRaw = firstAttr(productAttrs, variantAttrs, "estimated-duration");
		const durationLabel = durationLabelFromRaw(durationRaw);

		const depCity = firstAttrValue(productAttrs, variantAttrs, "departure-city");
		const arrCity = firstAttrValue(productAttrs, variantAttrs, "arrival-city");
		const depStation = firstAttr(productAttrs, variantAttrs, "departure-station");
		if (depStation) stationSet.set(depStation.toLowerCase(), depStation);

		if (!bagages) {
			const b = firstAttr(productAttrs, variantAttrs, "bagages");
			if (b) bagages = b;
		}
		if (!cancellation) {
			const c = firstAttr(productAttrs, variantAttrs, "cancellation");
			if (c) cancellation = c;
		}

		const amount = p.pricing?.priceRange?.start?.gross?.amount ?? null;
		const currency = p.pricing?.priceRange?.start?.gross?.currency ?? "XOF";

		routes.push({
			productId: p.id,
			productName: p.name,
			productSlug: p.slug,
			label: parseRouteLabel(p.name),
			durationLabel,
			priceAmount: amount,
			currency,
			originSlug: depCity?.slug ?? null,
			originId: depCity?.id ?? null,
			destinationSlug: arrCity?.slug ?? null,
			destinationId: arrCity?.id ?? null,
		});
	}

	return {
		routes,
		stations: Array.from(stationSet.values()).sort((a, b) => a.localeCompare(b, "fr")),
		bagages,
		cancellation,
	};
}

export function formatPriceFcfa(amount: number | null, currency: string): string {
	if (amount == null || !Number.isFinite(amount)) return "—";
	const n = Math.round(amount);
	const formatted = n.toLocaleString("fr-FR");
	if (currency === "XOF" || currency === "CFA") return `${formatted} FCFA`;
	return `${formatted} ${currency}`;
}
