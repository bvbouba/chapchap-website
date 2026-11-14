const PLATFORM_CHANNEL_SLUGS = new Set(["ci", "default-channel", "default"]);

/** Marketplace / platform channels — not an operator storefront. */
export function isPlatformChannelSlug(slug: string): boolean {
	return PLATFORM_CHANNEL_SLUGS.has(slug.trim().toLowerCase());
}
