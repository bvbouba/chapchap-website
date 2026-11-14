"use client";

import { useState } from "react";
import { MessageCircle, Phone, Search, Ticket } from "lucide-react";
import type { FaqItem } from "@/lib/parseFaqFromEditorJs";
import { telHrefFromE164, whatsappUrlFromE164 } from "@/lib/loadShopContact";

type Props = {
	faqs: FaqItem[];
	phoneDisplay: string;
	phoneE164: string;
	hoursLabel?: string;
};

export function ContactSupportPage({
	faqs = [],
	phoneDisplay,
	phoneE164,
	hoursLabel = "Du lundi au dimanche (7h – 20h)",
}: Props) {
	const [lookup, setLookup] = useState("");
	const [openFaq, setOpenFaq] = useState<number | null>(faqs.length > 0 ? 0 : null);

	const hasPhone = Boolean(phoneE164);
	const wa = (prefill?: string) =>
		hasPhone ? whatsappUrlFromE164(phoneE164, prefill) : "#";

	const onLookup = (e: React.FormEvent) => {
		e.preventDefault();
		if (!hasPhone) return;
		const ref = lookup.trim();
		const message = ref
			? `Bonjour ChapChap, je souhaite retrouver mon billet. Référence / téléphone : ${ref}`
			: "Bonjour ChapChap, je souhaite retrouver mon billet.";
		window.open(wa(message), "_blank", "noopener,noreferrer");
	};

	return (
		<>
			<section className="border-b border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
					<h1 className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
						Besoin d&apos;aide ? Nous sommes là pour vous.
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-[#505050] sm:text-base">
						L&apos;équipe ChapChap Tickets et nos compagnies partenaires vous accompagnent 7j/7 pour
						vos voyages en bus.
					</p>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
				<h2 className="sr-only">Canaux de contact directs</h2>
				<div className="grid gap-5 md:grid-cols-2">
					<div className="rounded-2xl border border-[#E8E9EC] bg-white p-6 shadow-sm">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8F8EF]">
							<MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden />
						</div>
						<h3 className="mt-4 text-lg font-bold text-[#111111]">WhatsApp Support Direct</h3>
						<p className="mt-1 text-sm text-[#505050]">Réponse rapide en moins de 5 min.</p>
						{hasPhone ? (
							<a
								href={wa("Bonjour ChapChap, j’ai besoin d’assistance.")}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-bold text-white transition hover:bg-[#1ebe57]"
							>
								Discuter sur WhatsApp
							</a>
						) : (
							<p className="mt-5 text-sm text-[#606060]">Numéro WhatsApp bientôt disponible.</p>
						)}
					</div>

					<div className="rounded-2xl border border-[#E8E9EC] bg-white p-6 shadow-sm">
						<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0EE]">
							<Phone className="h-5 w-5 text-[#EB1700]" aria-hidden />
						</div>
						<h3 className="mt-4 text-lg font-bold text-[#111111]">Assistance Téléphonique</h3>
						<p className="mt-1 text-sm text-[#505050]">{hoursLabel}</p>
						{hasPhone ? (
							<a
								href={telHrefFromE164(phoneE164)}
								className="mt-5 inline-flex items-center gap-2 text-lg font-bold text-[#111111] hover:text-[#EB1700]"
							>
								<Phone className="h-5 w-5 text-[#EB1700]" aria-hidden />
								{phoneDisplay || phoneE164}
							</a>
						) : (
							<p className="mt-5 text-sm text-[#606060]">Numéro bientôt disponible.</p>
						)}
					</div>
				</div>
			</section>

			<section className="border-y border-[#E8E9EC] bg-white">
				<div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
					<div className="flex items-start gap-3">
						<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
							<Ticket className="h-5 w-5 text-[#6C8D26]" aria-hidden />
						</span>
						<div>
							<h2 className="text-xl font-bold text-[#111111]">Retrouver mon billet</h2>
							<p className="mt-1 max-w-2xl text-sm leading-6 text-[#505050]">
								Saisissez votre numéro de téléphone ou la référence de réservation pour être mis
								en relation avec l&apos;assistance et recevoir votre e-billet par SMS / WhatsApp.
							</p>
						</div>
					</div>

					<form
						onSubmit={onLookup}
						className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch"
					>
						<label className="relative block min-w-0 flex-1">
							<span className="sr-only">Numéro de téléphone ou référence</span>
							<Search
								className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
								aria-hidden
							/>
							<input
								type="text"
								value={lookup}
								onChange={(e) => setLookup(e.target.value)}
								placeholder="Numéro de téléphone ou référence (ex: CC-12345)"
								className="h-12 w-full rounded-xl border border-[#E2E3E7] bg-[#F7F7F8] py-2 pl-11 pr-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
							/>
						</label>
						<button
							type="submit"
							disabled={!hasPhone}
							className="inline-flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white transition hover:bg-[#c91400] disabled:bg-neutral-300"
						>
							Retrouver billet
						</button>
					</form>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:pb-16">
				<h2 className="text-xl font-bold text-[#111111]">Questions fréquentes</h2>
				{faqs.length === 0 ? (
					<p className="mt-4 text-sm text-[#606060]">
						Les questions fréquentes seront bientôt disponibles.
					</p>
				) : (
					<ul className="mt-6 divide-y divide-[#E8E9EC] rounded-2xl border border-[#E8E9EC] bg-white">
						{faqs.map((faq, index) => {
							const open = openFaq === index;
							return (
								<li key={`${faq.q}-${index}`}>
									<button
										type="button"
										aria-expanded={open}
										onClick={() => setOpenFaq(open ? null : index)}
										className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
									>
										<span className="font-semibold text-[#111111]">{faq.q}</span>
										<span className="mt-0.5 text-[#9CA3AF]" aria-hidden>
											{open ? "−" : "+"}
										</span>
									</button>
									{open ? (
										<p className="px-5 pb-4 text-sm leading-6 text-[#505050]">{faq.a}</p>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</section>
		</>
	);
}
