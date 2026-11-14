/** Channel public metadata keys for the operator company profile (customer storefront). */

export const COMPANY_META = {
	logoUrl: "logo_url",
	displayName: "display_name",
	slogan: "slogan",
	description: "description",
	supportPhone: "support_phone",
	supportEmail: "support_email",
	defaultAmenities: "default_amenities",
	/** Numeric: number of bags allowed per passenger. */
	bagagesAllowed: "bagages_allowed",
	/** Numeric: hours before departure when cancellation/modification is free. */
	cancellationHours: "cancellation_hours",
	/** Optional display label for the main station / hub. */
	principalStation: "principal_station",
} as const;

export type CompanyProfileFields = {
	logoUrl: string;
	displayName: string;
	slogan: string;
	description: string;
	supportPhone: string;
	supportEmail: string;
	amenitySlugs: string[];
	bagagesAllowed: string;
	cancellationHours: string;
	principalStation: string;
};

export function metaValue(
	metadata: Array<{ key: string; value: string }> | null | undefined,
	key: string,
): string {
	const hit = (metadata ?? []).find((m) => m.key === key);
	return (hit?.value ?? "").trim();
}

export function parseAmenitySlugs(raw: string): string[] {
	const trimmed = raw.trim();
	if (!trimmed) return [];
	try {
		const parsed = JSON.parse(trimmed) as unknown;
		if (Array.isArray(parsed)) {
			return parsed.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
		}
	} catch {
		// comma-separated fallback
	}
	return trimmed
		.split(/[,;]+/)
		.map((s) => s.trim())
		.filter(Boolean);
}

export function companyProfileFromChannel(channel: {
	name?: string | null;
	slug?: string | null;
	metadata?: Array<{ key: string; value: string }> | null;
}): CompanyProfileFields {
	const metadata = channel.metadata ?? [];
	const channelName = (channel.name ?? "").trim();
	const slug = (channel.slug ?? "").trim();
	// Prefer human name; never fall back to title-cased slug (e.g. "Operator A").
	const displayName =
		metaValue(metadata, COMPANY_META.displayName) ||
		(channelName && channelName.toLowerCase() !== slug.toLowerCase() ? channelName : "") ||
		channelName;

	return {
		logoUrl: metaValue(metadata, COMPANY_META.logoUrl),
		displayName,
		slogan: metaValue(metadata, COMPANY_META.slogan),
		description: metaValue(metadata, COMPANY_META.description),
		supportPhone: metaValue(metadata, COMPANY_META.supportPhone),
		supportEmail: metaValue(metadata, COMPANY_META.supportEmail),
		amenitySlugs: parseAmenitySlugs(metaValue(metadata, COMPANY_META.defaultAmenities)),
		bagagesAllowed: metaValue(metadata, COMPANY_META.bagagesAllowed),
		cancellationHours: metaValue(metadata, COMPANY_META.cancellationHours),
		principalStation: metaValue(metadata, COMPANY_META.principalStation),
	};
}
