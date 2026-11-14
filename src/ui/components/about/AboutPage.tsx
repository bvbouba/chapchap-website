import Link from "next/link";
import {
	BusFront,
	Handshake,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	ShieldCheck,
	Smartphone,
	Ticket,
	Users,
} from "lucide-react";
import { telHrefFromE164, whatsappUrlFromE164 } from "@/lib/loadShopContact";

type Props = {
	channel: string;
	phoneDisplay: string;
	phoneE164: string;
	streetAddress1?: string;
	city?: string;
};

const BENEFITS = [
	{
		icon: Smartphone,
		title: "100% Numérique",
		body: "Plus besoin de vous déplacer à la gare pour réserver. Votre téléphone suffit.",
		tone: "green" as const,
	},
	{
		icon: ShieldCheck,
		title: "Paiement Sécurisé",
		body: "Intégration directe avec Wave, Orange Money, MTN Moov et Moov Money.",
		tone: "red" as const,
	},
	{
		icon: Ticket,
		title: "Accès Garanti",
		body: "Présentez simplement votre code de confirmation ou votre SMS à la gare le jour du départ.",
		tone: "green" as const,
	},
	{
		icon: Phone,
		title: "Support Réactif",
		body: "Une équipe locale basée à Abidjan pour vous accompagner à chaque étape de votre voyage.",
		tone: "red" as const,
	},
];

export function AboutPage({
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

	return (
		<>
			<section className="relative overflow-hidden border-b border-[#E8E9EC]">
				<div
					className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#F1F7E4_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#FFF0EE_0%,_#FAFAFA_50%)]"
					aria-hidden
				/>
				<div
					className="absolute inset-0 opacity-[0.35]"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236C8D26' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
					}}
					aria-hidden
				/>

				<div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-20">
					<p className="about-fade text-xs font-bold uppercase tracking-[0.14em] text-[#6C8D26]">
						ChapChap Tickets
					</p>
					<h1 className="about-fade about-delay-1 mt-3 max-w-3xl text-3xl font-bold tracking-tight text-[#111111] sm:text-5xl sm:leading-[1.1]">
						Le voyage interurbain, enfin simple, rapide et sans stress.
					</h1>
					<p className="about-fade about-delay-2 mt-5 max-w-2xl text-base leading-7 text-[#505050] sm:text-lg">
						Nous connectons les voyageurs aux meilleures compagnies de transport ivoiriennes via le
						mobile — réservation en quelques minutes, e-billet par SMS et WhatsApp, paiement Mobile
						Money.
					</p>
					<div className="about-fade about-delay-3 mt-8 flex flex-wrap gap-3">
						<Link
							href={`/${encodeURIComponent(channel)}`}
							className="inline-flex h-12 items-center justify-center rounded-xl bg-[#EB1700] px-5 text-sm font-bold text-white transition hover:bg-[#c91400]"
						>
							Rechercher un trajet
						</Link>
						<Link
							href={`/${encodeURIComponent(channel)}/compagnies`}
							className="inline-flex h-12 items-center justify-center rounded-xl border border-[#E2E3E7] bg-white px-5 text-sm font-bold text-[#111111] transition hover:bg-[#F7F7F8]"
						>
							Voir les compagnies
						</Link>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
				<div className="max-w-3xl">
					<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
						Notre mission
					</h2>
					<p className="mt-4 text-[15px] leading-7 text-[#404040]">
						Payer son billet à la gare sous le soleil, faire la queue pendant des heures ou risquer de
						ne pas trouver de place le jour du départ appartient désormais au passé.
					</p>
					<p className="mt-4 text-[15px] leading-7 text-[#404040]">
						Grâce à notre plateforme web et mobile, vous pouvez{" "}
						<strong className="font-semibold text-[#111111]">
							rechercher un trajet, comparer les horaires des compagnies partenaires et réserver votre
							e-billet en moins de 2 minutes
						</strong>{" "}
						avec vos moyens de paiement habituels (Wave, Orange Money, MTN, Moov).
					</p>
				</div>
			</section>

			<section className="border-y border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
					<div className="flex items-start gap-3">
						<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
							<Handshake className="h-5 w-5 text-[#6C8D26]" aria-hidden />
						</span>
						<div>
							<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
								En partenariat avec les transporteurs
							</h2>
							<p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#505050]">
								ChapChap Tickets ne possède pas de cars. Nous sommes le{" "}
								<strong className="font-semibold text-[#111111]">partenaire technologique</strong> des
								compagnies de transport locales — elles gèrent la route, nous gérons la technologie.
							</p>
						</div>
					</div>

					<div className="mt-10 grid gap-10 md:grid-cols-2">
						<div>
							<div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#6C8D26]">
								<Users className="h-4 w-4" aria-hidden />
								Pour les voyageurs
							</div>
							<ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#404040]">
								<li className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB1700]" aria-hidden />
									Réservation fluide et billets numériques envoyés par SMS et WhatsApp
								</li>
								<li className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB1700]" aria-hidden />
									Service client disponible 7j/7
								</li>
							</ul>
						</div>
						<div>
							<div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#6C8D26]">
								<BusFront className="h-4 w-4" aria-hidden />
								Pour les compagnies
							</div>
							<ul className="mt-4 space-y-3 text-[15px] leading-6 text-[#404040]">
								<li className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB1700]" aria-hidden />
									Outil numérique pour optimiser le remplissage et digitaliser la vente
								</li>
								<li className="flex gap-2">
									<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EB1700]" aria-hidden />
									Sans investissement lourd en infrastructure
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-16">
				<h2 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
					Pourquoi choisir ChapChap Tickets ?
				</h2>
				<p className="mt-2 max-w-2xl text-sm text-[#606060]">
					Sécurité, commodité et Mobile Money — les bases de la confiance pour votre premier trajet.
				</p>

				<ul className="mt-8 grid gap-8 sm:grid-cols-2">
					{BENEFITS.map(({ icon: Icon, title, body, tone }) => (
						<li key={title} className="flex gap-4">
							<span
								className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
									tone === "green" ? "bg-[#F1F7E4]" : "bg-[#FFF0EE]"
								}`}
							>
								<Icon
									className={`h-5 w-5 ${tone === "green" ? "text-[#6C8D26]" : "text-[#EB1700]"}`}
									aria-hidden
								/>
							</span>
							<div>
								<h3 className="font-bold text-[#111111]">{title}</h3>
								<p className="mt-1 text-sm leading-6 text-[#505050]">{body}</p>
							</div>
						</li>
					))}
				</ul>
			</section>

			<section className="border-t border-[#E8E9EC] bg-[#111111] text-white">
				<div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-14">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Contactez-nous</h2>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
						Vous êtes un voyageur et avez besoin d&apos;aide ? Vous êtes une compagnie de transport et
						souhaitez devenir partenaire ?
					</p>

					<ul className="mt-8 space-y-4 text-sm sm:text-base">
						<li className="flex items-center gap-3">
							<Mail className="h-5 w-5 shrink-0 text-[#A8C96A]" aria-hidden />
							<a href="mailto:contact@chapchap.ci" className="font-semibold hover:underline">
								contact@chapchap.ci
							</a>
						</li>
						{hasPhone ? (
							<li className="flex flex-wrap items-center gap-3">
								<MessageCircle className="h-5 w-5 shrink-0 text-[#25D366]" aria-hidden />
								<a
									href={whatsappUrlFromE164(
										phoneE164,
										"Bonjour ChapChap, j’aimerais en savoir plus.",
									)}
									target="_blank"
									rel="noopener noreferrer"
									className="font-semibold hover:underline"
								>
									WhatsApp / Support : {phoneDisplay || `+${phoneE164}`}
								</a>
								<span className="text-white/40">·</span>
								<a
									href={telHrefFromE164(phoneE164)}
									className="inline-flex items-center gap-1.5 text-white/80 hover:text-white hover:underline"
								>
									<Phone className="h-4 w-4" aria-hidden />
									Appeler
								</a>
							</li>
						) : null}
						<li className="flex items-center gap-3">
							<MapPin className="h-5 w-5 shrink-0 text-[#A8C96A]" aria-hidden />
							<span>{location}</span>
						</li>
					</ul>

					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							href={`/${encodeURIComponent(channel)}/contactus`}
							className="inline-flex h-11 items-center justify-center rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white transition hover:bg-[#c91400]"
						>
							Page assistance
						</Link>
						<Link
							href={`/${encodeURIComponent(channel)}/partners`}
							className="inline-flex h-11 items-center justify-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white transition hover:bg-white/10"
						>
							Devenir partenaire
						</Link>
					</div>
				</div>
			</section>

			<style>{`
				@keyframes aboutFadeUp {
					from { opacity: 0; transform: translateY(12px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.about-fade {
					animation: aboutFadeUp 0.55s ease-out both;
				}
				.about-delay-1 { animation-delay: 0.08s; }
				.about-delay-2 { animation-delay: 0.16s; }
				.about-delay-3 { animation-delay: 0.24s; }
				@media (prefers-reduced-motion: reduce) {
					.about-fade { animation: none; }
				}
			`}</style>
		</>
	);
}
