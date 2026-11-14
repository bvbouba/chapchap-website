import React from "react";
import { Bus } from "lucide-react";
import { Title } from "@/checkout/components";
import { ErrorContentWrapper } from "@/checkout/components/ErrorContentWrapper";

export const EmptyCartPage = () => {
	return (
		<ErrorContentWrapper>
			<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F9E8]">
				<Bus className="h-7 w-7 text-[#A6C65A]" aria-hidden />
			</div>
			<Title className="mb-0 text-xl text-[#111111]">Aucune réservation en cours</Title>
			<p className="mt-2 text-sm leading-6 text-[#606060]">
				Il semble que vous n&apos;ayez pas encore sélectionné de trajet. Recherchez une ligne et
				réservez votre place pour continuer.
			</p>
			<a
				href="/"
				className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white hover:bg-[#c91400]"
			>
				Rechercher un trajet
			</a>
		</ErrorContentWrapper>
	);
};
