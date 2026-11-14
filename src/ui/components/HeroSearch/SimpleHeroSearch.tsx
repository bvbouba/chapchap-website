"use client";

import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { TripSearchForm, type FormValues } from "./form";
import { type citiesType } from "./HeroSearch";
import { type TripSearchData, useTripSearch } from "@/context/TripSearchContext";

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
				const rawChannel = params.channel;
				const channel = Array.isArray(rawChannel) ? rawChannel[0] : rawChannel;
				if (!channel) return;

				router.push(`/${channel}/trips/${values.origin.id}/${values.destination.id}?date=${values.date}`);
				resolve();
			});
		});
	};

	return (
		<section className="sticky top-0 z-30 border-b border-[#E8E9EC] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
			<div className="mx-auto w-full max-w-6xl px-3 py-2.5 sm:px-8 sm:py-3">
				<div className="rounded-2xl border border-[#E8E9EC] bg-white px-3 py-3 shadow-sm sm:px-4">
					<TripSearchForm
						onSubmit={handleSearchSubmit}
						data={data}
						cities={cities}
						isPending={isPending}
						compact
					/>
				</div>
			</div>
		</section>
	);
};
