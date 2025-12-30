import { getAllCities } from "@/actions";
import { HeroSearch } from "@/ui/components/HeroSearch/HeroSearch";

export const metadata = {
	title: "Chapchap Tickets – Trouvez et réservez votre prochain trajet",
	description:
		"Explorez, comparez et réservez vos trajets facilement avec ChapChap Tickes. Découvrez des destinations populaires, des offres avantageuses et une expérience fluide de réservation.",
};

export default async function Page() {
	const cities = await getAllCities();
	return (
		<>
			<HeroSearch cities={cities} />
			<section className="mx-auto max-w-7xl p-8 pb-16">
				{/* <h2 className="sr-only">Destinations populaires</h2>
		  <ProductList products={products} /> */}
			</section>
		</>
	);
}
