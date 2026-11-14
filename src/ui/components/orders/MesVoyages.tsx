"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bus } from "lucide-react";
import { VoyageTicketCard } from "./VoyageTicketCard";
import {
	getTravelDate,
	isVoyageHistorique,
	type VoyageOrder,
} from "@/lib/voyageOrders";

type Tab = "upcoming" | "past";

type Props = {
	orders: VoyageOrder[];
	operatorLogos?: Record<string, string>;
	firstName?: string | null;
	email?: string | null;
};

export function MesVoyages({ orders, operatorLogos = {}, firstName, email }: Props) {
	const [tab, setTab] = useState<Tab>("upcoming");

	const { upcoming, past } = useMemo(() => {
		const now = new Date();
		const withTrip = orders.filter((o) => (o.lines?.length ?? 0) > 0);
		const upcomingOrders = withTrip
			.filter((o) => !isVoyageHistorique(o, now))
			.sort((a, b) => getTravelDate(a).getTime() - getTravelDate(b).getTime());
		const pastOrders = withTrip
			.filter((o) => isVoyageHistorique(o, now))
			.sort((a, b) => getTravelDate(b).getTime() - getTravelDate(a).getTime());
		return { upcoming: upcomingOrders, past: pastOrders };
	}, [orders]);

	const list = tab === "upcoming" ? upcoming : past;
	const greetingName = firstName?.trim() || email?.split("@")[0] || "voyageur";

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
			<header className="mb-6">
				<p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A6C65A]">
					ChapChap Tickets
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-[#111111]">Mes Voyages</h1>
				<p className="mt-2 text-sm leading-6 text-[#606060]">
					Bonjour {greetingName}, retrouvez tous vos billets de car ci-dessous.
				</p>
			</header>

			<div className="mb-6 flex rounded-2xl border border-[#D7D8DB] bg-white p-1.5">
				<button
					type="button"
					onClick={() => setTab("upcoming")}
					className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold transition ${
						tab === "upcoming"
							? "bg-[#EB1700] text-white"
							: "text-[#606060] hover:bg-[#F7F7F8]"
					}`}
				>
					À venir{upcoming.length > 0 ? ` (${upcoming.length})` : ""}
				</button>
				<button
					type="button"
					onClick={() => setTab("past")}
					className={`flex-1 rounded-xl px-3 py-3 text-sm font-bold transition ${
						tab === "past"
							? "bg-[#EB1700] text-white"
							: "text-[#606060] hover:bg-[#F7F7F8]"
					}`}
				>
					Historique{past.length > 0 ? ` (${past.length})` : ""}
				</button>
			</div>

			{list.length === 0 ? (
				<div className="flex flex-col items-center rounded-2xl border border-[#E2E3E7] bg-white px-6 py-14 text-center">
					<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F9E8]">
						<Bus className="h-7 w-7 text-[#A6C65A]" aria-hidden />
					</div>
					<p className="text-lg font-bold text-[#111111]">Aucun voyage</p>
					<p className="mt-2 max-w-sm text-sm leading-6 text-[#606060]">
						{tab === "upcoming"
							? "Vous n'avez pas de voyages prévus. Réservez votre prochain trajet en quelques clics."
							: "Votre historique de voyage est vide pour le moment."}
					</p>
					{tab === "upcoming" ? (
						<Link
							href="/"
							className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white hover:bg-[#c91400]"
						>
							Rechercher un trajet
						</Link>
					) : null}
				</div>
			) : (
				<ul className="space-y-5">
					{list.map((order) => (
						<li key={order.id}>
							<VoyageTicketCard
								order={order}
								operatorLogoUrl={operatorLogos[order.id]}
							/>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
