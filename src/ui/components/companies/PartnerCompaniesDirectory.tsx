"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { ArrowRight, BadgeCheck, MapPin, Phone, Search } from "lucide-react";
import type { PartnerCompany } from "@/lib/loadPartnerCompanies";

type Props = {
	companies: PartnerCompany[];
};

function normalizeSearch(value: string): string {
	return value
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim();
}

export function PartnerCompaniesDirectory({ companies }: Props) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [suggestionsOpen, setSuggestionsOpen] = useState(false);
	const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const filtered = useMemo(() => {
		const q = normalizeSearch(query);
		if (!q) return companies;
		return companies.filter((c) => {
			const hay = normalizeSearch(
				[c.displayName, c.slug, c.supportPhone, c.principalStation, c.slogan].join(" "),
			);
			return hay.includes(q);
		});
	}, [companies, query]);

	const goToCompany = (company: PartnerCompany) => {
		setSuggestionsOpen(false);
		setQuery(company.displayName);
		router.push(company.href);
	};

	const onSubmitSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (filtered.length === 1) {
			goToCompany(filtered[0]);
			return;
		}
		const exact = filtered.find(
			(c) =>
				normalizeSearch(c.displayName) === normalizeSearch(query) ||
				normalizeSearch(c.slug) === normalizeSearch(query),
		);
		if (exact) goToCompany(exact);
	};

	return (
		<>
			<section className="border-b border-[#E8E9EC] bg-[#FAFAFA]">
				<div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14">
					<h1 className="text-3xl font-bold tracking-tight text-[#111111] sm:text-4xl">
						Compagnies de Transport Partenaires
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-[#505050] sm:text-base">
						Trouvez les informations de contact, gares et politiques de nos transporteurs
						partenaires en Côte d&apos;Ivoire.
					</p>

					<form onSubmit={onSubmitSearch} className="relative mt-8 max-w-xl">
						<label className="relative block">
							<span className="sr-only">Rechercher une compagnie</span>
							<Search
								className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9CA3AF]"
								aria-hidden
							/>
							<input
								type="text"
								role="combobox"
								aria-expanded={suggestionsOpen && query.trim().length > 0}
								aria-controls="company-search-results"
								aria-autocomplete="list"
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSuggestionsOpen(true);
								}}
								onFocus={() => {
									if (blurTimer.current) clearTimeout(blurTimer.current);
									setSuggestionsOpen(true);
								}}
								onBlur={() => {
									blurTimer.current = setTimeout(() => setSuggestionsOpen(false), 150);
								}}
								placeholder="Rechercher une compagnie… (ex: Operator A, UTB, STC…)"
								className="h-12 w-full rounded-xl border border-[#E2E3E7] bg-white py-2 pl-11 pr-4 text-sm text-[#111111] placeholder:text-[#9CA3AF] focus:border-[#EB1700] focus:outline-none focus:ring-1 focus:ring-[#EB1700]"
								autoComplete="off"
							/>
						</label>

						{suggestionsOpen && query.trim().length > 0 ? (
							<ul
								id="company-search-results"
								role="listbox"
								className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-[#E2E3E7] bg-white py-1 shadow-lg"
							>
								{filtered.length === 0 ? (
									<li className="px-4 py-3 text-sm text-[#606060]">Aucune compagnie trouvée</li>
								) : (
									filtered.map((company) => (
										<li key={company.slug} role="option">
											<button
												type="button"
												className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-[#303030] hover:bg-neutral-100"
												onMouseDown={(e) => e.preventDefault()}
												onClick={() => goToCompany(company)}
											>
												<span className="font-semibold">{company.displayName}</span>
												<span className="text-xs text-[#9CA3AF]">/{company.slug}</span>
											</button>
										</li>
									))
								)}
							</ul>
						) : null}
					</form>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
				<h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#606060]">
					<MapPin className="h-4 w-4 text-[#6C8D26]" aria-hidden />
					Principales compagnies en Côte d&apos;Ivoire
				</h2>

				{filtered.length === 0 ? (
					<p className="mt-8 text-sm text-[#606060]">
						{companies.length === 0
							? "Aucune compagnie partenaire n’est disponible pour le moment."
							: `Aucune compagnie ne correspond à « ${query.trim()} ». Essayez un autre nom.`}
					</p>
				) : (
					<ul className="mt-6 grid gap-5 sm:grid-cols-2">
						{filtered.map((company) => (
							<li key={company.slug}>
								<Link
									href={company.href}
									className="flex h-full flex-col rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm transition hover:border-[#D5D6DB] hover:shadow-md"
								>
									<div className="flex items-start gap-3">
										{company.logoUrl ? (
											<div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#E8E9EC] bg-white">
												<Image
													src={company.logoUrl}
													alt=""
													fill
													className="object-contain p-1"
													sizes="56px"
													unoptimized
												/>
											</div>
										) : (
											<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F1F7E4] text-lg font-bold text-[#6C8D26]">
												{company.displayName.charAt(0).toUpperCase()}
											</div>
										)}
										<div className="min-w-0">
											<h3 className="truncate text-lg font-bold text-[#111111]">
												{company.displayName}
											</h3>
											<span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-[#F1F7E4] px-2.5 py-0.5 text-xs font-semibold text-[#3D5A1A]">
												<span className="h-1.5 w-1.5 rounded-full bg-[#6C8D26]" aria-hidden />
												Partenaire officiel
												<BadgeCheck className="h-3.5 w-3.5" aria-hidden />
											</span>
										</div>
									</div>

									<div className="mt-4 space-y-2 text-sm text-[#505050]">
										{company.supportPhone ? (
											<p className="flex items-center gap-2">
												<Phone className="h-4 w-4 shrink-0 text-[#6C8D26]" aria-hidden />
												<span className="font-medium text-[#303030]">{company.supportPhone}</span>
											</p>
										) : null}
										{company.principalStation ? (
											<p className="flex items-center gap-2">
												<MapPin className="h-4 w-4 shrink-0 text-[#6C8D26]" aria-hidden />
												<span>
													Gare principale :{" "}
													<span className="font-medium text-[#303030]">
														{company.principalStation}
													</span>
												</span>
											</p>
										) : null}
										{!company.supportPhone && !company.principalStation && company.slogan ? (
											<p className="line-clamp-2 text-[#606060]">{company.slogan}</p>
										) : null}
									</div>

									<div className="mt-auto pt-5">
										<span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#EB1700]">
											Voir la fiche &amp; horaires
											<ArrowRight className="h-4 w-4" aria-hidden />
										</span>
									</div>
								</Link>
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}
