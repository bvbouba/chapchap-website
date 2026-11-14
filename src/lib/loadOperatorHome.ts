import {
	CategoryBySlugDocument,
	ChannelCompanyBySlugDocument,
	OperatorHomepageProductsDocument,
} from "@/gql/graphql";
import {
	companyProfileFromChannel,
	type CompanyProfileFields,
} from "@/lib/companyProfile";
import { executeGraphQL } from "@/lib/graphql";
import {
	isPlatformFeeProduct,
	mapOperatorProducts,
	type OperatorRouteRow,
} from "@/lib/operatorHomepage";
import { saleorAppAuth } from "@/lib/saleorAppAuth";

export type OperatorHomeData = {
	profile: CompanyProfileFields;
	routes: OperatorRouteRow[];
	bagages: string | null;
	cancellation: string | null;
	stations: string[];
};

/** "Operator A: Abidjan → Bouaké" → "Operator A" */
export function displayNameFromProductName(productName: string): string | null {
	const trimmed = productName.trim();
	const colon = trimmed.indexOf(":");
	if (colon <= 0 || !trimmed.includes("→")) return null;
	const prefix = trimmed.slice(0, colon).trim();
	return prefix || null;
}

function looksLikeSlug(value: string, channelSlug: string): boolean {
	const v = value.trim().toLowerCase();
	const slug = channelSlug.trim().toLowerCase();
	if (!v) return true;
	if (v === slug) return true;
	return v === slug.replace(/-/g, " ");
}

function humanizeSlug(slug: string): string {
	return slug
		.split("-")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function resolveDisplayName(input: {
	profileDisplayName: string;
	channelSlug: string;
	channelName?: string | null;
	categoryName?: string | null;
	productDerivedName?: string | null;
}): string {
	const slug = input.channelSlug.trim();
	const candidates = [
		input.profileDisplayName,
		(input.channelName ?? "").trim(),
		(input.productDerivedName ?? "").trim(),
		(input.categoryName ?? "").trim(),
	].filter(Boolean);

	for (const c of candidates) {
		if (!looksLikeSlug(c, slug)) return c;
	}

	const humanized = humanizeSlug(slug);
	return humanized || candidates[0] || "Compagnie";
}

/** Fill empty profile fields from a secondary source (usually public category). */
function mergeProfileGaps(
	primary: CompanyProfileFields,
	fallback: CompanyProfileFields,
): CompanyProfileFields {
	return {
		logoUrl: primary.logoUrl || fallback.logoUrl,
		displayName: primary.displayName || fallback.displayName,
		slogan: primary.slogan || fallback.slogan,
		description: primary.description || fallback.description,
		supportPhone: primary.supportPhone || fallback.supportPhone,
		supportEmail: primary.supportEmail || fallback.supportEmail,
		amenitySlugs:
			primary.amenitySlugs.length > 0 ? primary.amenitySlugs : fallback.amenitySlugs,
		bagagesAllowed: primary.bagagesAllowed || fallback.bagagesAllowed,
		cancellationHours: primary.cancellationHours || fallback.cancellationHours,
		principalStation: primary.principalStation || fallback.principalStation,
	};
}

export async function loadOperatorHomeData(channel: string): Promise<OperatorHomeData> {
	const appAuth = saleorAppAuth();
	if (!appAuth) {
		console.warn(
			"[loadOperatorHome] SALEOR_APP_TOKEN is missing — using public category metadata for company profile.",
		);
	}

	const [channelRes, categoryRes, productsRes] = await Promise.all([
		appAuth
			? executeGraphQL(ChannelCompanyBySlugDocument, {
					variables: { slug: channel },
					revalidate: 60,
					...appAuth,
				}).catch((error) => {
					console.error("ChannelCompanyBySlug failed:", error);
					return null;
				})
			: Promise.resolve(null),
		executeGraphQL(CategoryBySlugDocument, {
			variables: { slug: channel },
			revalidate: 60,
			withAuth: false,
		}).catch((error) => {
			console.error("CategoryBySlug failed:", error);
			return null;
		}),
		executeGraphQL(OperatorHomepageProductsDocument, {
			variables: { channel, first: 20 },
			revalidate: 60,
			withAuth: false,
		}).catch((error) => {
			console.error("OperatorHomepageProducts failed:", error);
			return null;
		}),
	]);

	const mapped = mapOperatorProducts(productsRes?.products?.edges);
	const productLogo =
		productsRes?.products?.edges?.find(
			(e) =>
				e.node.thumbnail?.url &&
				!isPlatformFeeProduct({ slug: e.node.slug, name: e.node.name }),
		)?.node?.thumbnail?.url?.trim() || "";

	const productDerivedName =
		productsRes?.products?.edges
			?.map((e) => displayNameFromProductName(e.node.name))
			.find((n) => n && !looksLikeSlug(n, channel)) ?? null;

	const channelNode = channelRes?.channel;
	const categoryNode = categoryRes?.category;

	const categoryProfile = categoryNode
		? companyProfileFromChannel({
				name: categoryNode.name,
				slug: categoryNode.slug,
				metadata: categoryNode.metadata ?? [],
			})
		: companyProfileFromChannel({ name: "", slug: channel, metadata: [] });

	const channelProfile = channelNode
		? companyProfileFromChannel(channelNode)
		: companyProfileFromChannel({ name: "", slug: channel, metadata: [] });

	// Channel (app token) wins; public category fills gaps when token is missing.
	let profile = mergeProfileGaps(channelProfile, categoryProfile);

	const displayName = resolveDisplayName({
		profileDisplayName: profile.displayName,
		channelSlug: channel,
		channelName: channelNode?.name,
		categoryName: categoryNode?.name,
		productDerivedName,
	});
	profile = { ...profile, displayName };

	if (!profile.logoUrl && productLogo) {
		profile = { ...profile, logoUrl: productLogo };
	}

	const bagages =
		profile.bagagesAllowed.trim() || mapped.bagages || null;
	const cancellation =
		profile.cancellationHours.trim() || mapped.cancellation || null;

	return {
		profile,
		routes: mapped.routes,
		bagages,
		cancellation,
		stations: mapped.stations,
	};
}
