import { type Metadata } from "next";
import { PageGetBySlugDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { loadShopContact } from "@/lib/loadShopContact";
import { parseFaqFromEditorJs } from "@/lib/parseFaqFromEditorJs";
import { ContactSupportPage } from "@/ui/components/contact/ContactSupportPage";

export const metadata: Metadata = {
	title: "Contact & assistance | ChapChap Tickets",
	description:
		"WhatsApp, téléphone et aide pour retrouver votre billet ChapChap Tickets en Côte d'Ivoire.",
};

export default async function ContactUsPage() {
	const [shop, pageRes] = await Promise.all([
		loadShopContact(),
		executeGraphQL(PageGetBySlugDocument, {
			variables: { slug: "contactez-nous" },
			revalidate: 60 * 10,
			withAuth: false,
		}).catch((error) => {
			console.error("PageGetBySlug contactez-nous failed:", error);
			return null;
		}),
	]);

	const faqs = parseFaqFromEditorJs(pageRes?.page?.content);

	return (
		<ContactSupportPage
			faqs={faqs}
			phoneDisplay={shop.phoneDisplay}
			phoneE164={shop.phoneE164}
		/>
	);
}
