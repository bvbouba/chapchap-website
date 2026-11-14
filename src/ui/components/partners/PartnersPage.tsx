"use client";

import Link from "next/link";
import { useState } from "react";
import {
	ArrowRight,
	BusFront,
	CheckCircle2,
	Mail,
	MapPin,
	MessageCircle,
	ScanLine,
	ShieldCheck,
	Store,
	TrendingUp,
	Users,
	Wallet,
} from "lucide-react";
import { telHrefFromE164, whatsappUrlFromE164 } from "@/lib/loadShopContact";

type PartnerType = "compagnie" | "point-de-vente";

type Props = {
	channel: string;
	phoneDisplay: string;
	phoneE164: string;
	streetAddress1?: string;
	city?: string;
};

const COMPANY_BENEFITS = [
	{
		icon: TrendingUp,
		title: "Nouveau canal de vente",
		body: "Touchez des milliers de voyageurs qui préfèrent réserver depuis leur téléphone (Wave, Orange Money, MTN, Moov).",
	},
	{
		icon: Users,
		title: "Gestion des flux en gare",
		body: "Réduisez l'encombrement aux guichets en étalant les réservations en amont.",
	},
	{
		icon: ScanLine,
		title: "Outils de validation simples",
		body: "Vos chefs de gare et convoyeurs valident les e-billets en un scan ou une vérification de code.",
	},
	{
		icon: ShieldCheck,
		title: "Paiements sécurisés",
		body: "Traçabilité totale des ventes et reversements rapides et transparents.",
	},
];

const AGENT_BENEFITS = [
	{
		icon: Wallet,
		title: "Commissions attractives",
		body: "Percevez une commission sur chaque billet vendu dans votre établissement.",
	},
	{
		icon: Store,
		title: "Diversification de vos services",
		body: "Attirez plus de passage dans votre commerce (cybercafé, agence Mobile Money, boutique).",
	},
	{
		icon: CheckCircle2,
		title: "Plateforme intuitive",
		body: "Une interface simple pour émettre des billets en quelques secondes.",
	},
];

export function PartnersPage({
	channel,
	phoneDisplay,
	phoneE164,
	streetAddress1 = "",
	city = "",
}: Props) {
	const hasPhone = Boolean(phoneE164);
	const location =
		[streetAddress1, city || "Abidjan, Côte d'Ivoire"].filter(Boolean).join(" · ") ||
		"Abidjan, Côte d'Ivoire";

	const [name, setName] = useState("");
	const [partnerType, setPartnerType] = useState<PartnerType>("compagnie");
	const [locationField, setLocationField] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const scrollToForm = (type?: PartnerType) => {
		if (type) setPartnerType(type);
		document.getElementById("formulaire-partenaire")?.scrollIntoView({ behavior: "smooth" });
	};

	const onSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!name.trim() || !locationField.trim() || !phone.trim()) {
			setError("Veuillez renseigner au minimum le nom, la ville et le téléphone WhatsApp.");
			return;
		}

		const typeLabel =
			partnerType === "compagnie" ? "Compagnie de Transport" : "Point de Vente / Agence";

		const message = [
			"Bonjour ChapChap — Demande de partenariat",
			"",
			`Nom / Raison sociale : ${name.trim()}`,
			`Type : ${typeLabel}`,
			`Ville / Localisation : ${locationField.trim()}`,
			`WhatsApp : ${phone.trim()}`,
			email.trim() ? `E-mail : ${email.trim()}` : null,
		]
			.filter(Boolean)
			.join("\n");

		if (hasPhone) {
			window.open(whatsappUrlFromE164(phoneE164, message), "_blank", "noopener,noreferrer");
			setSubmitted(true);
			return;
		}

		const mailto = `mailto:partenaires@chapchap.ci?subject=${encodeURIComponent(
			`Partenariat — ${typeLabel}`,
		)}&body=${encodeURIComponent(message)}`;
		window.location.href = mailto;
		setSubmitted(true);
	};

	return (
		<>
			<section className="relative overflow-hidden border-b border-[#E8E9EC]">
				<div
					className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#FFF0EE_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_right,_#F1F7E4_0%,_#FAFAFA_55%)]"
					aria-hidden
				/>
				<div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
					<p className="partners-fade text-xs font-bold uppercase tracking-[0.14em] text-[#EB1700]">
						ChapChap Tickets · Partenariats
					</p>
					<h1 className="partners-fade partners-delay-1 mt-3 max-w-3xl text-3xl font-bold tracking-tight text-[#111111] sm:text-5xl sm:leading-[1.1]">
						Devenir Partenaire ChapChap Tickets
					</h1>
					<p className="partners-fade partners-delay-2 mt-5 max-w-2xl text-base leading-7 text-[#505050] sm:text-lg">
						Digitalisez votre activité et développez votre clientèle dans toute la Côte d&apos;Ivoire.
						Nous combinons mobile et Mobile Money pour moderniser vos ventes et remplir vos cars plus
						rapidement.
					</p>
					<div className="partners-fade partners-delay-3 mt-8 flex flex-wrap gap-3">
						<button
							type="button"
							onClick={() => scrollToForm("compagnie")}
							className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white transition hover:bg-[#c91400]"
						>
							Compagnie de transport
							<ArrowRight className="h-4 w-4" aria-hidden />
						</button>
						<button
							type="button"
							onClick={() => scrollToForm("point-de-vente")}
							className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E2E3E7] bg-white px-5 text-sm font-bold text-[#111111] transition hover:bg-[#F7F7F8]"
						>
							Point de vente
						</button>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
				<div className="flex items-start gap-3">
					<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0EE]">
						<BusFront className="h-5 w-5 text-[#EB1700]" aria-hidden />
					</span>
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
							Vous êtes une Compagnie de Transport ?
						</h2>
						<p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#505050]">
							Augmentez le taux de remplissage de vos cars et réduisez les files d&apos;attente à la
							gare grâce à notre solution de billetterie intelligente.
						</p>
					</div>
				</div>

				<ul className="mt-8 grid gap-6 sm:grid-cols-2">
					{COMPANY_BENEFITS.map(({ icon: Icon, title, body }) => (
						<li key={title} className="flex gap-4">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
								<Icon className="h-5 w-5 text-[#6C8D26]" aria-hidden />
							</span>
							<div>
								<h3 className="font-bold text-[#111111]">{title}</h3>
								<p className="mt-1 text-sm leading-6 text-[#505050]">{body}</p>
							</div>
						</li>
					))}
				</ul>

				<p className="mt-8 max-w-2xl border-l-2 border-[#6C8D26] pl-4 text-sm leading-6 text-[#404040]">
					<strong className="font-semibold text-[#111111]">Zéro investissement lourd :</strong> nous
					vous fournissons la technologie et formons vos équipes à la gare.
				</p>

				<button
					type="button"
					onClick={() => scrollToForm("compagnie")}
					className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 text-sm font-bold text-white transition hover:bg-[#303030]"
				>
					Devenir Compagnie Partenaire
					<ArrowRight className="h-4 w-4" aria-hidden />
				</button>
			</section>

			<section className="border-y border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
					<div className="flex items-start gap-3">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
							<Store className="h-5 w-5 text-[#6C8D26]" aria-hidden />
						</span>
						<div>
							<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
								Vous êtes un Point de Vente / Agence de Voyage ?
							</h2>
							<p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#505050]">
								Devenez un guichet agréé ChapChap Tickets et générez des revenus supplémentaires en
								vendant des billets de car à votre clientèle locale.
							</p>
						</div>
					</div>

					<ul className="mt-8 grid gap-6 sm:grid-cols-3">
						{AGENT_BENEFITS.map(({ icon: Icon, title, body }) => (
							<li key={title}>
								<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
									<Icon className="h-5 w-5 text-[#EB1700]" aria-hidden />
								</span>
								<h3 className="mt-3 font-bold text-[#111111]">{title}</h3>
								<p className="mt-1 text-sm leading-6 text-[#505050]">{body}</p>
							</li>
						))}
					</ul>

					<button
						type="button"
						onClick={() => scrollToForm("point-de-vente")}
						className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white transition hover:bg-[#c91400]"
					>
						Devenir Point de Vente
						<ArrowRight className="h-4 w-4" aria-hidden />
					</button>
				</div>
			</section>

			<section
				id="formulaire-partenaire"
				className="mx-auto max-w-6xl scroll-mt-24 px-4 py-12 sm:px-8 sm:py-16"
			>
				<div className="max-w-2xl">
					<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
						Formulaire de contact partenaire
					</h2>
					<p className="mt-3 text-[15px] leading-7 text-[#505050]">
						Remplissez ce formulaire et notre équipe commerciale vous recontactera sous{" "}
						<strong className="font-semibold text-[#111111]">24h</strong>.
					</p>
				</div>

				{submitted ? (
					<div className="mt-8 max-w-2xl rounded-2xl border border-[#D9E8B8] bg-[#F1F7E4] px-5 py-5">
						<p className="font-bold text-[#3D5A1A]">Demande prête à envoyer</p>
						<p className="mt-1 text-sm leading-6 text-[#3D5A1A]/90">
							WhatsApp (ou votre messagerie) s&apos;est ouvert avec votre demande. Si rien ne
							s&apos;affiche, contactez-nous directement ci-dessous.
						</p>
						<button
							type="button"
							onClick={() => setSubmitted(false)}
							className="mt-4 text-sm font-semibold text-[#6C8D26] underline"
						>
							Modifier ma demande
						</button>
					</div>
				) : (
					<form onSubmit={onSubmit} className="mt-8 max-w-2xl space-y-5">
						<label className="block">
							<span className="text-sm font-semibold text-[#303030]">
								Nom complet / Raison sociale
							</span>
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Ex: Transport Express / Boutique Yopougon"
								required
								className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E3E7] bg-[#F7F7F8] px-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
							/>
						</label>

						<fieldset>
							<legend className="text-sm font-semibold text-[#303030]">Type de partenariat</legend>
							<div className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
								<label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E3E7] bg-white px-4 py-3 text-sm has-[:checked]:border-[#EB1700] has-[:checked]:bg-[#FFF8F6]">
									<input
										type="radio"
										name="partnerType"
										checked={partnerType === "compagnie"}
										onChange={() => setPartnerType("compagnie")}
										className="text-[#EB1700] focus:ring-[#EB1700]"
									/>
									Compagnie de Transport
								</label>
								<label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E2E3E7] bg-white px-4 py-3 text-sm has-[:checked]:border-[#EB1700] has-[:checked]:bg-[#FFF8F6]">
									<input
										type="radio"
										name="partnerType"
										checked={partnerType === "point-de-vente"}
										onChange={() => setPartnerType("point-de-vente")}
										className="text-[#EB1700] focus:ring-[#EB1700]"
									/>
									Point de Vente
								</label>
							</div>
						</fieldset>

						<label className="block">
							<span className="text-sm font-semibold text-[#303030]">Ville / Localisation</span>
							<input
								type="text"
								value={locationField}
								onChange={(e) => setLocationField(e.target.value)}
								placeholder="Ex: Abidjan (Adjamé), Bouaké, Yamoussoukro…"
								required
								className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E3E7] bg-[#F7F7F8] px-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
							/>
						</label>

						<label className="block">
							<span className="text-sm font-semibold text-[#303030]">
								Numéro de téléphone (WhatsApp)
							</span>
							<input
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Ex: +225 07 00 00 00 00"
								required
								className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E3E7] bg-[#F7F7F8] px-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
							/>
						</label>

						<label className="block">
							<span className="text-sm font-semibold text-[#303030]">
								Adresse e-mail <span className="font-normal text-[#9CA3AF]">(optionnel)</span>
							</span>
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="Ex: contact@votreentreprise.ci"
								className="mt-1.5 h-12 w-full rounded-xl border border-[#E2E3E7] bg-[#F7F7F8] px-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
							/>
						</label>

						{error ? <p className="text-sm font-medium text-[#EB1700]">{error}</p> : null}

						<button
							type="submit"
							className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white transition hover:bg-[#c91400] sm:w-auto"
						>
							Envoyer ma demande
						</button>
					</form>
				)}
			</section>

			<section className="border-t border-[#E8E9EC] bg-[#111111] text-white">
				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-14">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Contact direct — Équipe partenariats
					</h2>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
						Vous préférez discuter directement avec notre responsable commercial ?
					</p>

					<ul className="mt-8 space-y-4 text-sm sm:text-base">
						{hasPhone ? (
							<li className="flex flex-wrap items-center gap-3">
								<MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" aria-hidden />
								<a
									href={whatsappUrlFromE164(
										phoneE164,
										"Bonjour ChapChap, je souhaite devenir partenaire.",
									)}
									target="_blank"
									rel="noopener noreferrer"
									className="font-semibold hover:underline"
								>
									WhatsApp Business : {phoneDisplay || `+${phoneE164}`}
								</a>
								<span className="text-white/40">·</span>
								<a
									href={telHrefFromE164(phoneE164)}
									className="text-white/80 hover:text-white hover:underline"
								>
									Appeler
								</a>
							</li>
						) : null}
						<li className="flex items-center gap-3">
							<Mail className="h-5 w-5 shrink-0 text-[#A8C96A]" aria-hidden />
							<a href="mailto:partenaires@chapchap.ci" className="font-semibold hover:underline">
								partenaires@chapchap.ci
							</a>
						</li>
						<li className="flex items-center gap-3">
							<MapPin className="h-5 w-5 shrink-0 text-[#A8C96A]" aria-hidden />
							<span>{location}</span>
						</li>
					</ul>

					<div className="mt-8">
						<Link
							href={`/${encodeURIComponent(channel)}/a-propos`}
							className="text-sm font-semibold text-white/70 underline hover:text-white"
						>
							En savoir plus sur ChapChap Tickets
						</Link>
					</div>
				</div>
			</section>

			<style>{`
				@keyframes partnersFadeUp {
					from { opacity: 0; transform: translateY(12px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.partners-fade {
					animation: partnersFadeUp 0.55s ease-out both;
				}
				.partners-delay-1 { animation-delay: 0.08s; }
				.partners-delay-2 { animation-delay: 0.16s; }
				.partners-delay-3 { animation-delay: 0.24s; }
				@media (prefers-reduced-motion: reduce) {
					.partners-fade { animation: none; }
				}
			`}</style>
		</>
	);
}
