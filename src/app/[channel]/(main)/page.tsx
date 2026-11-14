import { type Metadata } from "next";
import { getAllCities } from "@/actions";
import { MenuGetBySlugDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { isPlatformChannelSlug } from "@/lib/isPlatformChannel";
import { loadOperatorHomeData } from "@/lib/loadOperatorHome";
import { HeroSearch } from "@/ui/components/HeroSearch/HeroSearch";
import { HomepageSections } from "@/ui/components/HomepageSections";
import { OperatorHome } from "@/ui/components/operator/OperatorHome";

type PageParams = { channel: string };

export async function generateMetadata({
	params,
}: {
	params: Promise<PageParams>;
}): Promise<Metadata> {
	const { channel } = await params;
	if (isPlatformChannelSlug(channel)) {
		return {
			title: "Chapchap Tickets – Trouvez et réservez votre prochain trajet",
			description:
				"Explorez, comparez et réservez vos trajets facilement avec ChapChap Tickets. Découvrez des destinations populaires, des offres avantageuses et une expérience fluide de réservation.",
		};
	}
	const data = await loadOperatorHomeData(channel);
	const name = data.profile.displayName.trim() || "Compagnie";
	const slogan = data?.profile.slogan;
	return {
		title: `${name} | ChapChap Tickets`,
		description:
			slogan ||
			data?.profile.description?.slice(0, 160) ||
			`Réservez vos billets de bus chez ${name} sur ChapChap Tickets.`,
	};
}

export default async function Page({ params }: { params: Promise<PageParams> }) {
	const { channel } = await params;
	const cities = await getAllCities();

	if (!isPlatformChannelSlug(channel)) {
		const data = await loadOperatorHomeData(channel);
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

	const popularDestinationsData = await executeGraphQL(MenuGetBySlugDocument, {
		variables: { slug: "popular-destinations", channel },
		revalidate: 60 * 60,
		withAuth: false,
	}).catch((error) => {
		console.error("Unable to load popular destinations:", error);
		return null;
	});

	const popularDestinations =
		popularDestinationsData?.menu?.items?.flatMap((item) =>
			item.collection
				? [
						{
							slug: item.collection.slug,
							name: item.collection.name,
							imageUrl: item.collection.backgroundImage?.url,
							imageAlt: item.collection.backgroundImage?.alt,
						},
					]
				: [],
		) ?? [];

	return (
		<>
			<HeroSearch cities={cities} />
			<HomepageSections channel={channel} popularDestinations={popularDestinations} />
		</>
	);
}
