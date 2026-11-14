import Link from "next/link";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { Logo } from "./Logo";
import { MenuGetBySlugDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";

export async function Footer({ channel }: { channel: string }) {
	const footerLinks = await executeGraphQL(MenuGetBySlugDocument, {
		variables: { slug: "footer", channel },
		revalidate: 60 * 60 * 24,
		withAuth: false,
	});

	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-[#E2E3E7] bg-[#F7F7F8]">
			<div className="mx-auto max-w-[1200px] px-4 lg:px-8">
				<div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
					<div>
						<Logo />
						<p className="mt-5 max-w-xs text-sm leading-6 text-[#606060]">
							Votre plateforme de réservation de billets de bus en Côte d&apos;Ivoire.
						</p>
					</div>
					{footerLinks.menu?.items?.map((item) => {
						return (
							<div key={item.id}>
								<h3 className="text-sm font-bold uppercase tracking-wide text-[#303030]">{item.name}</h3>
								<ul className="mt-4 space-y-3 [&>li]:text-[#606060]">
									{item.children?.map((child) => {
										if (child.category) {
											return (
												<li key={child.id} className="text-sm">
													<Link href={`/${child.category.slug}/compagnies`}>{child.category.name}</Link>
												</li>
											);
										}
										if (child.collection) {
											return (
												<li key={child.id} className="text-sm">
													<LinkWithChannel href={`/collections/${child.collection.slug}`}>
														{child.collection.name}
													</LinkWithChannel>
												</li>
											);
										}
										if (child.page) {
											return (
												<li key={child.id} className="text-sm">
													<LinkWithChannel href={`/pages/${child.page.slug}`}>
														{child.page.title}
													</LinkWithChannel>
												</li>
											);
										}
										if (child.url) {
											return (
												<li key={child.id} className="text-sm">
													<LinkWithChannel href={child.url}>{child.name}</LinkWithChannel>
												</li>
											);
										}
										return null;
									})}
								</ul>
							</div>
						);
					})}
				</div>

				<div className="flex flex-col justify-between gap-3 border-t border-neutral-200 py-8 sm:flex-row sm:items-center">
					<p className="text-sm text-[#606060]">
						&copy; {currentYear} ChapChap Tickets. Tous droits réservés.
					</p>
					<nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#606060]">
						<LinkWithChannel href="/a-propos" className="hover:text-[#111111] hover:underline">
							À propos
						</LinkWithChannel>
						<LinkWithChannel href="/partners" className="hover:text-[#111111] hover:underline">
							Devenir partenaire
						</LinkWithChannel>
						<LinkWithChannel href="/conditions" className="hover:text-[#111111] hover:underline">
							Conditions générales
						</LinkWithChannel>
						<LinkWithChannel href="/privacy-policy" className="hover:text-[#111111] hover:underline">
							Confidentialité
						</LinkWithChannel>
						<LinkWithChannel href="/contactus" className="hover:text-[#111111] hover:underline">
							Contact
						</LinkWithChannel>
					</nav>
				</div>
			</div>
		</footer>
	);
}
