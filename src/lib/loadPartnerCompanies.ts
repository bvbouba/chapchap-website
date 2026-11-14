import {
	CategoryBySlugDocument,
	ChannelsListDocument,
	MenuGetBySlugDocument,
} from "@/gql/graphql";
import {
	companyProfileFromChannel,
	metaValue,
} from "@/lib/companyProfile";
import { executeGraphQL } from "@/lib/graphql";
import { isPlatformChannelSlug } from "@/lib/isPlatformChannel";
import { saleorAppAuth } from "@/lib/saleorAppAuth";

export type PartnerCompany = {
	slug: string;
	displayName: string;
	logoUrl: string;
	supportPhone: string;
	principalStation: string;
	slogan: string;
	href: string;
};

function normalizeMenuUrl(raw: string | null | undefined): string | null {
	const value = (raw ?? "").trim();
	if (!value) return null;
	if (value.startsWith("/")) return value;
	try {
		const parsed = new URL(value);
		return parsed.pathname || null;
	} catch {
		return null;
	}
}

function slugFromHref(href: string): string {
	const path = href.replace(/\/+$/, "");
	const parts = path.split("/").filter(Boolean);
	return parts[0] || "";
}

function isOperatorMeta(
	metadata: Array<{ key: string; value: string }> | null | undefined,
): boolean {
	const flag = metaValue(metadata, "is_operator").toLowerCase();
	return flag === "true" || flag === "1" || flag === "yes";
}

async function enrichFromCategory(slug: string): Promise<{
	displayName: string;
	logoUrl: string;
	supportPhone: string;
	principalStation: string;
	slogan: string;
} | null> {
	try {
		const res = await executeGraphQL(CategoryBySlugDocument, {
			variables: { slug },
			revalidate: 300,
			withAuth: false,
		});
		const cat = res.category;
		if (!cat) return null;
		const profile = companyProfileFromChannel({
			name: cat.name,
			slug: cat.slug,
			metadata: cat.metadata ?? [],
		});
		return {
			displayName: profile.displayName || cat.name,
			logoUrl: profile.logoUrl,
			supportPhone: profile.supportPhone,
			principalStation: profile.principalStation,
			slogan: profile.slogan,
		};
	} catch {
		return null;
	}
}

async function loadFromChannels(): Promise<PartnerCompany[] | null> {
	const appAuth = saleorAppAuth();
	if (!appAuth) return null;

	try {
		const res = await executeGraphQL(ChannelsListDocument, {
			revalidate: 300,
			...appAuth,
		});
		const rows = (res.channels ?? [])
			.filter((c) => c.isActive && !isPlatformChannelSlug(c.slug))
			.filter((c) => {
				const meta = c.metadata ?? [];
				// Prefer explicit flag; otherwise any non-platform active channel.
				return isOperatorMeta(meta) || meta.length > 0 || Boolean(c.name);
			})
			.map((c) => {
				const profile = companyProfileFromChannel(c);
				const displayName =
					profile.displayName.trim() ||
					c.name.trim() ||
					c.slug;
				return {
					slug: c.slug,
					displayName,
					logoUrl: profile.logoUrl,
					supportPhone: profile.supportPhone,
					principalStation: profile.principalStation,
					slogan: profile.slogan,
					href: `/${encodeURIComponent(c.slug)}`,
				} satisfies PartnerCompany;
			})
			.sort((a, b) =>
				a.displayName.localeCompare(b.displayName, "fr", { sensitivity: "base" }),
			);

		return rows;
	} catch (error) {
		console.error("ChannelsList for partners failed:", error);
		return null;
	}
}

function slugifyName(name: string): string {
	return name
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 48);
}

async function loadFromNavbarMenu(marketplaceChannel: string): Promise<PartnerCompany[]> {
	try {
		const res = await executeGraphQL(MenuGetBySlugDocument, {
			variables: { slug: "navbar", channel: marketplaceChannel },
			revalidate: 300,
			withAuth: false,
		});

		const parent =
			(res.menu?.items ?? []).find((item) => (item.children?.length ?? 0) > 0) ??
			null;
		const children = parent?.children ?? [];

		const mapped = await Promise.all(
			children.map(async (child) => {
				const fromUrl =
					normalizeMenuUrl(child.url) ||
					(child.category ? `/${child.category.slug}` : null);
				const slug =
					child.category?.slug ||
					(fromUrl ? slugFromHref(fromUrl) : "") ||
					slugifyName(child.name || "");
				if (!slug || isPlatformChannelSlug(slug)) return null;

				const enriched = await enrichFromCategory(slug);
				return {
					slug,
					displayName:
						enriched?.displayName ||
						child.category?.name ||
						child.name ||
						slug,
					logoUrl: enriched?.logoUrl || "",
					supportPhone: enriched?.supportPhone || "",
					principalStation: enriched?.principalStation || "",
					slogan: enriched?.slogan || "",
					href: `/${encodeURIComponent(slug)}`,
				} satisfies PartnerCompany;
			}),
		);

		return mapped
			.filter((row): row is PartnerCompany => Boolean(row))
			.sort((a, b) =>
				a.displayName.localeCompare(b.displayName, "fr", { sensitivity: "base" }),
			);
	} catch (error) {
		console.error("Navbar partners fallback failed:", error);
		return [];
	}
}

export async function loadPartnerCompanies(
	marketplaceChannel = "ci",
): Promise<PartnerCompany[]> {
	const fromChannels = await loadFromChannels();
	if (fromChannels && fromChannels.length > 0) return fromChannels;
	return loadFromNavbarMenu(marketplaceChannel);
}
