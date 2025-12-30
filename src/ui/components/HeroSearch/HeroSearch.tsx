"use client";

import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { TripSearchForm, type FormValues } from "./form";
import { useTripSearch } from "@/context/TripSearchContext";
import { type AssignedAttributeValueFragment } from "@/gql/graphql";

export type citiesType = {
	departureCities: AssignedAttributeValueFragment[];
	arrivalCities: AssignedAttributeValueFragment[];
};
interface props {
	cities: citiesType;
}

export const HeroSearch = ({ cities }: props) => {
	const router = useRouter();
	const params = useParams<{ channel: string }>();
	const { data } = useTripSearch();

	const [isPending, startTransition] = useTransition();

	const handleSearchSubmit = async (values: FormValues & { tripType: "oneway" | "roundtrip" }) => {
		return new Promise<void>((resolve) => {
			startTransition(() => {
				router.push(`/${params.channel}/trips/${values.origin.id}/${values.destination.id}`);
				// Note: We don't resolve immediately because we want the spinner
				// to stay until the next page is ready.
				resolve();
			});
		});
	};
	return (
		<section className="relative">
			<div
				className="relative h-[296px] bg-cover bg-no-repeat"
				style={{ backgroundImage: "url('/hero-header.svg')", backgroundPosition: "-270px center" }}
			>
				<div className="absolute inset-0 bg-black/20" />
			</div>

			<div className="relative z-10 -mt-40 flex items-center justify-center">
				<div className="mx-4 w-full max-w-6xl rounded-2xl bg-white p-8 text-[#44474a] shadow-xl">
					<h1 className="mb-2 text-xl md:text-2xl">
						Recherchez & Réservez des billets de bus pas chers en ligne
					</h1>
					<p className="mb-4 text-xs text-gray-600 md:text-sm">
						Trouvez et comparez les meilleures options de voyage terrestre en un seul endroit.
					</p>

					{/* ✅ Reusable trip form */}
					<TripSearchForm onSubmit={handleSearchSubmit} data={data} cities={cities} isPending={isPending} />
				</div>
			</div>
		</section>
	);
};
