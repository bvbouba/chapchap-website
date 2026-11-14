import { type Metadata } from "next";
import { loadShopContact } from "@/lib/loadShopContact";
import { AboutPage } from "@/ui/components/about/AboutPage";

type PageParams = { channel: string };

export const metadata: Metadata = {
	title: "À propos | ChapChap Tickets",
	description:
		"ChapChap Tickets digitalise le transport terrestre en Côte d'Ivoire : réservation mobile, e-billets SMS/WhatsApp et partenariat avec les compagnies locales.",
};

export default async function AProposPage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { channel } = await params;
	const shop = await loadShopContact();

	return (
		<AboutPage
			channel={channel}
			phoneDisplay={shop.phoneDisplay}
			phoneE164={shop.phoneE164}
			streetAddress1={shop.streetAddress1}
			city={shop.city}
		/>
	);
}
