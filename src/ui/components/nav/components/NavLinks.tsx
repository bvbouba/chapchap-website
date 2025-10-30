import Link from "next/link";
import { NavLink } from "./NavLink";
import { executeGraphQL } from "@/lib/graphql";
import { MenuGetBySlugDocument, type MenuItemFragment } from "@/gql/graphql";

type MenuItemWithChildren = MenuItemFragment & {
	children?: MenuItemFragment[];
};

export const NavLinks = async ({ channel }: { channel: string }) => {
	const navLinks = await executeGraphQL(MenuGetBySlugDocument, {
		variables: { slug: "navbar", channel },
		revalidate: 60 * 60 * 24,
	});

	const items = (navLinks.menu?.items ?? []) as MenuItemWithChildren[];

	const renderHref = (item: MenuItemFragment): string => {
		if (item.category) return `/categories/${item.category.slug}`;
		if (item.collection) return `/collections/${item.collection.slug}`;
		if (item.page) return `/pages/${item.page.slug}`;
		if (item.url) return item.url;
		return "#";
	};

	const isExternal = (href: string) => /^https?:\/\//.test(href);

	return (
		<nav className="flex items-center gap-6">
			{items.map((item) => {
				const href = renderHref(item);
				const hasChildren = item.children && item.children.length > 0;

				if (hasChildren) {
					return (
						<div key={item.id} className="group relative flex items-center">
							<NavLink key={item.id} href={href}>
								{item.name}
							</NavLink>

							<div className="absolute left-0 top-full hidden pt-3 group-hover:block">
								<div className="z-50 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
									{item.children?.map((child) => {
										const childHref = renderHref(child);
										const isExt = isExternal(childHref);

										if (isExt) {
											return (
												<a
													key={child.id}
													href={childHref}
													target="_blank"
													rel="noopener noreferrer"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
												>
													{child.name}
												</a>
											);
										}
										return (
											<Link
												key={child.id}
												href={childHref}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
											>
												{child.name}
											</Link>
										);
									})}
								</div>
							</div>
						</div>
					);
				}

				// No children
				if (item.category || item.collection || item.page) {
					return (
						<NavLink key={item.id} href={href}>
							{item.name}
						</NavLink>
					);
				}

				if (item.url) {
					const isExt = isExternal(href);
					if (isExt) {
						return (
							<a
								key={item.id}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								className="font-medium text-gray-800 hover:text-primary"
							>
								{item.name}
							</a>
						);
					}
					return (
						<Link key={item.id} href={href} className="font-medium text-gray-800 hover:text-primary">
							{item.name}
						</Link>
					);
				}

				return null;
			})}
		</nav>
	);
};
