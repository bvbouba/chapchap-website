import Image from "next/image";
import Link from "next/link";
import {
	ArrowRight,
	BadgeCheck,
	BusFront,
	Download,
	LockKeyhole,
	MessageSquareText,
	Smartphone,
	Zap,
} from "lucide-react";

type Props = {
	channel: string;
	popularDestinations: Array<{
		slug: string;
		name: string;
		imageUrl?: string | null;
		imageAlt?: string | null;
	}>;
};

export function HomepageSections({ channel, popularDestinations }: Props) {
	return (
		<>
			<section aria-labelledby="trust-title" className="border-y border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
					<h2 id="trust-title" className="sr-only">
						Pourquoi réserver avec ChapChap Tickets
					</h2>
					<div className="grid gap-5 md:grid-cols-3">
						<div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
							<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
								<Zap className="h-5 w-5 text-[#6C8D26]" />
							</span>
							<div>
								<h3 className="font-bold text-[#111111]">Réservation instantanée</h3>
								<p className="mt-1 text-sm leading-5 text-[#606060]">
									Recevez immédiatement votre billet électronique après paiement.
								</p>
							</div>
						</div>
						<div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
							<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF0EE]">
								<LockKeyhole className="h-5 w-5 text-[#EB1700]" />
							</span>
							<div>
								<h3 className="font-bold text-[#111111]">Paiement sécurisé</h3>
								<p className="mt-1 text-sm leading-5 text-[#606060]">
									Payez simplement avec vos moyens de paiement habituels.
								</p>
							</div>
						</div>
						<div className="flex gap-4 rounded-2xl bg-white p-5 shadow-sm">
							<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4]">
								<BadgeCheck className="h-5 w-5 text-[#6C8D26]" />
							</span>
							<div>
								<h3 className="font-bold text-[#111111]">Compagnies vérifiées</h3>
								<p className="mt-1 text-sm leading-5 text-[#606060]">
									Comparez des trajets proposés par des partenaires de confiance.
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[#E8E9EC] bg-white px-5 py-4 sm:flex-row">
						<div className="flex items-center gap-3">
							<MessageSquareText className="h-5 w-5 shrink-0 text-[#EB1700]" />
							<p className="text-sm font-semibold text-[#303030]">
								Billet électronique disponible instantanément après votre réservation
							</p>
						</div>
						<div className="flex flex-wrap items-center justify-center gap-4">
							<Image
								src="/payment-wave.png"
								alt="Wave"
								width={60}
								height={30}
								className="h-7 w-auto object-contain"
							/>
							<span className="rounded-lg bg-[#FF7900] px-3 py-1.5 text-xs font-bold text-white">
								Orange Money
							</span>
							<Image
								src="/payment-mtn.png"
								alt="MTN MoMo"
								width={60}
								height={30}
								className="h-7 w-auto object-contain"
							/>
							<span className="rounded-lg bg-[#F5F5F5] px-3 py-1.5 text-xs font-bold text-[#555555]">
								Moov Money
							</span>
						</div>
					</div>
				</div>
			</section>

			{popularDestinations.length > 0 && (
				<section aria-labelledby="popular-routes-title" className="bg-white">
					<div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 sm:py-16">
						<div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
							<div>
								<p className="text-sm font-bold uppercase tracking-[0.16em] text-[#EB1700]">
									Explorez la Côte d&apos;Ivoire
								</p>
								<h2
									id="popular-routes-title"
									className="mt-2 text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl"
								>
									Destinations populaires
								</h2>
							</div>
							<p className="max-w-md text-sm text-[#606060]">
								Choisissez un trajet apprécié des voyageurs et consultez les prochains départs.
							</p>
						</div>

						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							{popularDestinations.map((destination) => {
								const imageUrl = destination.imageUrl?.replace(/^http:\/\//, "https://");
								return (
									<Link
										key={destination.slug}
										href={`/${channel}/collections/${destination.slug}`}
										className="group relative flex min-h-64 overflow-hidden rounded-[20px] border border-[#E8E9EC] bg-[#3D5A1A] transition hover:-translate-y-1 hover:shadow-xl"
									>
										{imageUrl && (
											<Image
												src={imageUrl}
												alt={destination.imageAlt || destination.name}
												fill
												sizes="(min-width: 1024px) 245px, (min-width: 640px) 50vw, 100vw"
												className="object-cover transition duration-500 group-hover:scale-105"
											/>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
										<div className="relative mt-auto p-5 text-white">
											<p className="text-xs font-bold uppercase tracking-[0.14em] text-white/70">
												Au départ d&apos;Abidjan
											</p>
											<h3 className="mt-1 text-2xl font-bold">{destination.name}</h3>
											<span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-white">
												Voir les bus
												<ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					</div>
				</section>
			)}

			<section className="px-4 pb-14 sm:px-8 sm:pb-16">
				<div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] bg-[#3D5A1A] text-white md:grid-cols-[1.25fr_0.75fr]">
					<div className="p-7 sm:p-10 lg:p-12">
						<p className="text-sm font-bold uppercase tracking-[0.16em] text-[#CDE68F]">Application mobile</p>
						<h2 className="mt-3 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
							Emmenez ChapChap dans votre poche
						</h2>
						<p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
							Recherchez vos trajets et gardez vos billets à portée de main, où que vous soyez.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<span className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#303030]">
								<Download className="h-5 w-5 text-[#EB1700]" />
								Google Play · bientôt
							</span>
							<span className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold">
								<Smartphone className="h-5 w-5" />
								App Store · bientôt
							</span>
						</div>
					</div>
					<div className="relative hidden min-h-72 items-end justify-center bg-[#A6C65A] md:flex">
						<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.34),transparent_60%)]" />
						<div className="relative -mb-16 flex h-72 w-40 flex-col rounded-[32px] border-[7px] border-[#171717] bg-white p-3 shadow-2xl">
							<div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#171717]" />
							<div className="rounded-xl bg-[#A6C65A] p-3">
								<BusFront className="h-7 w-7 text-white" />
							</div>
							<div className="mt-4 h-3 w-24 rounded bg-[#E8E9EC]" />
							<div className="mt-2 h-2 w-16 rounded bg-[#E8E9EC]" />
							<div className="mt-5 space-y-2">
								<div className="h-10 rounded-xl bg-[#F5F5F5]" />
								<div className="h-10 rounded-xl bg-[#F5F5F5]" />
								<div className="h-10 rounded-xl bg-[#EB1700]" />
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
