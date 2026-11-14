"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTransition } from "react";
import { TripSearchForm, type FormValues } from "./form";
import { useTripSearch } from "@/context/TripSearchContext";
import { type AssignedAttributeValueFragment } from "@/gql/graphql";

export type citiesType = {
	departureCities: AssignedAttributeValueFragment[];
	arrivalCities: AssignedAttributeValueFragment[];
};

export type HeroOperatorBrand = {
	displayName: string;
	slogan?: string;
	logoUrl?: string;
};

interface props {
	cities: citiesType;
	operator?: HeroOperatorBrand;
}

export const HeroSearch = ({ cities, operator }: props) => {
	const router = useRouter();
	const params = useParams<{ channel: string }>();
	const { data } = useTripSearch();

	const [isPending, startTransition] = useTransition();

	const handleSearchSubmit = async (values: FormValues & { tripType: "oneway" | "roundtrip" }) => {
		return new Promise<void>((resolve) => {
			startTransition(() => {
				router.push(
					`/${params.channel}/trips/${values.origin.id}/${values.destination.id}?date=${values.date}`,
				);
				resolve();
			});
		});
	};

	const operatorSlogan = operator?.slogan?.trim() || "";

	return (
		<section className="relative bg-white">
			<div className="relative h-[260px] overflow-hidden rounded-b-[28px] bg-[#A6C65A] sm:h-[300px] md:h-[340px]">
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: "url('/hero-header.jpg')" }}
					aria-hidden
				/>
				<div
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(to bottom, rgba(61, 90, 26, 0.92) 0%, rgba(166, 198, 90, 0.72) 35%, rgba(166, 198, 90, 0.28) 65%, transparent 100%)",
					}}
					aria-hidden
				/>
				<div className="relative z-10 mx-auto max-w-[1200px] px-4 pt-8 text-white sm:px-8 sm:pt-10 md:pt-12">
					{operator ? (
						<>
							<div className="mb-4 flex flex-wrap items-center gap-3">
								{operator.logoUrl ? (
									<div className="relative h-12 w-12 overflow-hidden rounded-xl bg-white/95 sm:h-14 sm:w-14">
										<Image
											src={operator.logoUrl}
											alt=""
											fill
											className="object-contain p-1"
											sizes="56px"
											unoptimized
										/>
									</div>
								) : null}
								<div>
									{/* Brand once — section titles below stay action-oriented */}
									<h1 className="text-2xl font-bold tracking-tight drop-shadow-sm sm:text-3xl md:text-4xl">
										{operator.displayName}
									</h1>
									<span className="mt-1.5 inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm">
										Partenaire officiel ChapChap
									</span>
								</div>
							</div>
							{operatorSlogan ? (
								<p className="max-w-xl text-sm font-medium text-white/90 sm:text-base md:text-lg">
									{operatorSlogan}
								</p>
							) : null}
						</>
					) : (
						<>
							<h1 className="max-w-2xl text-3xl font-bold tracking-tight drop-shadow-sm sm:text-4xl md:text-5xl">
								Réservez vos billets de bus en quelques clics
							</h1>
							<p className="mt-3 max-w-xl text-sm font-medium text-white/90 sm:text-base md:text-lg">
								Voyagez en toute sérénité à travers toute la Côte d&apos;Ivoire.
							</p>
						</>
					)}
				</div>
			</div>

			<div className="relative z-10 -mt-20 flex items-start justify-center px-4 pb-8 sm:-mt-24 md:-mt-28">
				<div className="w-full max-w-[1200px] rounded-[20px] border border-[#E8E9EC] bg-white px-4 pb-5 pt-[18px] text-[#111111] shadow-[0_12px_30px_rgba(26,26,26,0.12)] sm:px-6">
					<h2 className="mb-[18px] text-[22px] font-bold tracking-[-0.3px] text-[#111111]">
						{operator ? "Rechercher un billet" : "Où allez-vous ?"}
					</h2>
					<TripSearchForm
						onSubmit={handleSearchSubmit}
						data={data}
						cities={cities}
						isPending={isPending}
					/>
				</div>
			</div>
		</section>
	);
};
