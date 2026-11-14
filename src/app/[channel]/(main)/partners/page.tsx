import { type Metadata } from "next";
import { loadShopContact } from "@/lib/loadShopContact";
import { PartnersPage } from "@/ui/components/partners/PartnersPage";

type PageParams = { channel: string };

export const metadata: Metadata = {
	title: "Devenir partenaire | ChapChap Tickets",
	description:
		"Compagnies de transport et points de vente : rejoignez le réseau ChapChap Tickets en Côte d'Ivoire. Billetterie digitale, Mobile Money et commissions.",
};

export default async function PartnersRoutePage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { channel } = await params;
	const shop = await loadShopContact();

	return (
		<PartnersPage
			channel={channel}
			phoneDisplay={shop.phoneDisplay}
			phoneE164={shop.phoneE164}
			streetAddress1={shop.streetAddress1}
			city={shop.city}
		/>
	);
}
