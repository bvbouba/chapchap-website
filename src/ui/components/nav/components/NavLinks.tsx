import Link from "next/link";
import { NavLink } from "./NavLink";
import { executeGraphQL } from "@/lib/graphql";
import { MenuGetBySlugDocument, type MenuItemFragment } from "@/gql/graphql";

type MenuItemWithChildren = MenuItemFragment & {
	children?: MenuItemFragment[] | null;
};

/** Turn Saleor absolute storefront URLs into pathnames for Next.js Link. */
function normalizeMenuUrl(raw: string | null | undefined): string | null {
	const value = (raw ?? "").trim();
	if (!value) return null;
	if (value.startsWith("/")) return value;
	try {
		const parsed = new URL(value);
		return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
	} catch {
		return value;
	}
}

function itemHref(item: MenuItemFragment, channel: string): string | null {
	if (item.category) return `/${item.category.slug}`;
	if (item.collection) return `/${channel}/collections/${item.collection.slug}`;
	if (item.page) return `/${channel}/pages/${item.page.slug}`;
	return normalizeMenuUrl(item.url);
}

function isExternalHref(href: string): boolean {
	return /^https?:\/\//i.test(href);
}

const dropdownLinkClass =
	"block px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-100";

export const NavLinks = async ({ channel }: { channel: string }) => {
	const navLinks = await executeGraphQL(MenuGetBySlugDocument, {
		variables: { slug: "navbar", channel },
		revalidate: 60 * 60 * 24,
		withAuth: false,
	});

	const items = (navLinks.menu?.items ?? []) as MenuItemWithChildren[];

	return (
		<>
			{items.map((item) => {
				const children = (item.children ?? []).filter(Boolean);
				const hasChildren = children.length > 0;

				if (hasChildren) {
					return (
						<li key={item.id} className="group relative inline-flex items-center">
							<span className="inline-flex cursor-default items-center border-b-2 border-transparent pt-px text-sm text-neutral-500 group-hover:text-primary">
								{item.name}
							</span>

							<div className="pointer-events-none invisible absolute left-0 top-full z-[60] min-w-[12rem] pt-2 opacity-0 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
								<div className="rounded-md border border-neutral-200 bg-white py-1 shadow-lg">
									{children.map((child) => {
										const href = itemHref(child, channel);
										if (!href) {
											return (
												<span
													key={child.id}
													className="block px-4 py-2.5 text-sm text-neutral-400"
												>
													{child.name}
												</span>
											);
										}
										if (isExternalHref(href)) {
											return (
												<a
													key={child.id}
													href={href}
													target="_blank"
													rel="noopener noreferrer"
													className={dropdownLinkClass}
												>
													{child.name}
												</a>
											);
										}
										return (
											<Link key={child.id} href={href} className={dropdownLinkClass}>
												{child.name}
											</Link>
										);
									})}
								</div>
							</div>
						</li>
					);
				}

				const href = itemHref(item, channel);
				if (!href) return null;

				if (item.category) {
					return (
						<li key={item.id} className="inline-flex">
							<Link
								href={href}
								className="inline-flex items-center border-b-2 border-transparent pt-px text-sm text-neutral-500 hover:text-primary"
							>
								{item.name}
							</Link>
						</li>
					);
				}

				if (item.collection) {
					return (
						<NavLink key={item.id} href={`/collections/${item.collection.slug}`}>
							{item.name}
						</NavLink>
					);
				}

				if (item.page) {
					return (
						<NavLink key={item.id} href={`/pages/${item.page.slug}`}>
							{item.name}
						</NavLink>
					);
				}

				if (isExternalHref(href)) {
					return (
						<li key={item.id} className="inline-flex">
							<a
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center text-sm text-neutral-500 hover:text-primary"
							>
								{item.name}
							</a>
						</li>
					);
				}

				return (
					<li key={item.id} className="inline-flex">
						<Link
							href={href}
							className="inline-flex items-center text-sm text-neutral-500 hover:text-primary"
						>
							{item.name}
						</Link>
					</li>
				);
			})}
		</>
	);
};
