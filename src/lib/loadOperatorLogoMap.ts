import { CategoryBySlugDocument, ChannelsListDocument } from "@/gql/graphql";
import { companyProfileFromChannel } from "@/lib/companyProfile";
import { executeGraphQL } from "@/lib/graphql";
import { isPlatformChannelSlug } from "@/lib/isPlatformChannel";
import { saleorAppAuth } from "@/lib/saleorAppAuth";

export type OperatorCardMeta = {
	logoUrl: string;
	bagagesAllowed: string;
	cancellationHours: string;
};

/** @deprecated Prefer OperatorCardMetaMap — kept for existing imports. */
export type OperatorLogoMap = Record<string, string>;

export type OperatorCardMetaMap = Record<string, OperatorCardMeta>;

async function metaFromCategory(slug: string): Promise<OperatorCardMeta> {
	try {
		const res = await executeGraphQL(CategoryBySlugDocument, {
			variables: { slug },
			revalidate: 60 * 30,
			withAuth: false,
		});
		const profile = companyProfileFromChannel({
			name: res.category?.name,
			slug: res.category?.slug,
			metadata: res.category?.metadata ?? [],
		});
		return {
			logoUrl: profile.logoUrl,
			bagagesAllowed: profile.bagagesAllowed,
			cancellationHours: profile.cancellationHours,
		};
	} catch {
		return { logoUrl: "", bagagesAllowed: "", cancellationHours: "" };
	}
}

/**
 * Operator card extras for trip results: logo + bags/cancellation from channel
 * (or public category) metadata.
 */
export async function loadOperatorCardMetaMap(): Promise<OperatorCardMetaMap> {
	const map: OperatorCardMetaMap = {};
	const appAuth = saleorAppAuth();
	const slugsNeedingCategory: string[] = [];

	if (appAuth) {
		try {
			const res = await executeGraphQL(ChannelsListDocument, {
				revalidate: 60 * 30,
				...appAuth,
			});
			for (const channel of res.channels ?? []) {
				if (!channel.isActive || isPlatformChannelSlug(channel.slug)) continue;
				const profile = companyProfileFromChannel(channel);
				map[channel.slug] = {
					logoUrl: profile.logoUrl,
					bagagesAllowed: profile.bagagesAllowed,
					cancellationHours: profile.cancellationHours,
				};
				if (!profile.logoUrl || !profile.bagagesAllowed || !profile.cancellationHours) {
					slugsNeedingCategory.push(channel.slug);
				}
			}
		} catch (error) {
			console.error("loadOperatorCardMetaMap ChannelsList failed:", error);
		}
	}

	if (slugsNeedingCategory.length) {
		const categoryRows = await Promise.all(
			slugsNeedingCategory.map(async (slug) => [slug, await metaFromCategory(slug)] as const),
		);
		for (const [slug, cat] of categoryRows) {
			const current = map[slug] ?? {
				logoUrl: "",
				bagagesAllowed: "",
				cancellationHours: "",
			};
			map[slug] = {
				logoUrl: current.logoUrl || cat.logoUrl,
				bagagesAllowed: current.bagagesAllowed || cat.bagagesAllowed,
				cancellationHours: current.cancellationHours || cat.cancellationHours,
			};
		}
	}

	return map;
}

/** Logo-only map for callers that only need URLs. */
export async function loadOperatorLogoMap(): Promise<OperatorLogoMap> {
	const full = await loadOperatorCardMetaMap();
	const logos: OperatorLogoMap = {};
	for (const [slug, meta] of Object.entries(full)) {
		if (meta.logoUrl) logos[slug] = meta.logoUrl;
	}
	return logos;
}

export async function resolveOperatorLogo(slug: string): Promise<string> {
	if (!slug) return "";
	const map = await loadOperatorLogoMap();
	if (map[slug]) return map[slug];
	return (await metaFromCategory(slug)).logoUrl;
}
