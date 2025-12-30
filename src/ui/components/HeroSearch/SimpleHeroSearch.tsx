"use client";

import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { TripSearchForm, type FormValues } from "./form";
import { type citiesType } from "./HeroSearch";
import { type TripSearchData, useTripSearch } from "@/context/TripSearchContext";

// ✅ Correction: Changement en Named Export pour satisfaire import/no-default-export
export const SimpleHeroSearch = ({ data, cities }: { data?: TripSearchData; cities: citiesType }) => {
	const { setData } = useTripSearch();
	const router = useRouter();
	const params = useParams();
	const [isPending, startTransition] = useTransition();

	const handleSearchSubmit = async (values: FormValues & { tripType: "oneway" | "roundtrip" }) => {
		const tripData: TripSearchData = {
			tripType: values.tripType,
			origin: {
				id: values.origin.id ?? "",
				name: values.origin.name ?? "",
				slug: values.origin.slug ?? "",
			},
			destination: {
				id: values.destination.id ?? "",
				name: values.destination.name ?? "",
				slug: values.destination.slug ?? "",
			},
			date: values.date,
			returnDate: values.returnDate,
		};

		setData({
			...tripData,
			query: {
				origin: values.origin.slug,
				destination: values.destination.slug,
				date: values.date,
			},
		});

		return new Promise<void>((resolve) => {
			startTransition(() => {
				// ✅ Correction: Extraction sécurisée du channel pour éviter le type string[]
				const rawChannel = params.channel || "ci";
				const channel = Array.isArray(rawChannel) ? rawChannel[0] : rawChannel;

				const currentPath = window.location.pathname;

				// ✅ Correction: Utilisation de la variable 'channel' nettoyée dans les templates literals
				if (currentPath.includes(`/${channel}/trips/`)) {
					const newPath = `/${channel}/trips/${values.origin.id}/${values.destination.id}`;
					router.push(newPath);
				} else if (currentPath.includes(`/${channel}/categories/`)) {
					const newPath = `/${channel}/categories/${values.origin.slug}-${values.destination.slug}`;
					window.history.pushState(null, "", newPath);
				}

				setTimeout(resolve, 800);
			});
		});
	};

	return (
		<section className="relative border-y border-gray-300">
			<div className="relative flex items-center justify-center">
				<div className="mx-4 w-full max-w-6xl rounded-2xl bg-white p-8 text-[#44474a]">
					<TripSearchForm onSubmit={handleSearchSubmit} data={data} cities={cities} isPending={isPending} />
				</div>
			</div>
		</section>
	);
};
