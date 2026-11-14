import { type Metadata } from "next";
import { isPlatformChannelSlug } from "@/lib/isPlatformChannel";
import { loadOperatorHomeData } from "@/lib/loadOperatorHome";
import { loadPartnerCompanies } from "@/lib/loadPartnerCompanies";
import { loadShopContact } from "@/lib/loadShopContact";
import { getAllCities } from "@/actions";
import { OperatorHome } from "@/ui/components/operator/OperatorHome";
import { PartnerCompaniesDirectory } from "@/ui/components/companies/PartnerCompaniesDirectory";
import { CompaniesHelpBox } from "@/ui/components/companies/CompaniesHelpBox";

type PageParams = { channel: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<PageParams>;
}): Promise<Metadata> {
	const { channel } = await params;
	if (isPlatformChannelSlug(channel)) {
		return {
			title: "Compagnies partenaires | ChapChap Tickets",
			description:
				"Trouvez les informations de contact, gares et politiques de nos transporteurs partenaires en Côte d'Ivoire.",
		};
	}
	const data = await loadOperatorHomeData(channel);
	const name = data.profile.displayName.trim() || "Compagnie";
	return {
		title: `${name} | ChapChap Tickets`,
		description:
			data.profile.slogan ||
			data.profile.description?.slice(0, 160) ||
			`Consultez les trajets de ${name}.`,
	};
}

export default async function CompagniesPage({
	params,
}: {
	params: Promise<PageParams>;
}) {
	const { channel } = await params;

	if (isPlatformChannelSlug(channel)) {
		const [companies, shop] = await Promise.all([
			loadPartnerCompanies(channel),
			loadShopContact(),
		]);
		return (
			<>
				<PartnerCompaniesDirectory companies={companies} />
				<CompaniesHelpBox
					channel={channel}
					phoneDisplay={shop.phoneDisplay}
					phoneE164={shop.phoneE164}
				/>
			</>
		);
	}

	const [cities, data] = await Promise.all([getAllCities(), loadOperatorHomeData(channel)]);

	return (
		<OperatorHome
			channel={channel}
			cities={cities}
			profile={data.profile}
			routes={data.routes}
			bagages={data.bagages}
			cancellation={data.cancellation}
			stations={data.stations}
		/>
	);
}
