import { Luggage, MapPin, Phone, Ticket } from "lucide-react";

type Props = {
	bagages: string | null;
	cancellation: string | null;
	stations: string[];
	supportPhone: string;
	supportEmail: string;
};

function bagagesLabel(raw: string): string {
	const n = parseInt(raw.trim(), 10);
	if (!Number.isFinite(n) || n < 0) return raw.trim();
	if (n === 0) return "Aucun bagage inclus";
	if (n === 1) return "1 bagage inclus par passager";
	return `${n} bagages inclus par passager`;
}

function cancellationLabel(raw: string): string {
	const n = parseInt(raw.trim(), 10);
	if (!Number.isFinite(n) || n < 0) return raw.trim();
	if (n === 0) return "Annulation selon conditions au guichet";
	if (n === 1) return "Modifiable ou annulable jusqu’à 1 h avant le départ";
	return `Modifiable ou annulable jusqu’à ${n} h avant le départ`;
}

export function OperatorPolicies({
	bagages,
	cancellation,
	stations,
	supportPhone,
	supportEmail,
}: Props) {
	const hasPolicies = Boolean(bagages || cancellation);
	const hasContact = Boolean(supportPhone || supportEmail);
	const hasStations = stations.length > 0;
	if (!hasPolicies && !hasContact && !hasStations) return null;

	const policyBadges: string[] = [];
	if (bagages?.trim()) {
		policyBadges.push(
			/^\d+$/.test(bagages.trim()) ? bagagesLabel(bagages) : bagages.trim(),
		);
	}
	if (cancellation?.trim()) {
		policyBadges.push(
			/^\d+$/.test(cancellation.trim())
				? cancellationLabel(cancellation)
				: cancellation.trim(),
		);
	}

	return (
		<section aria-labelledby="operator-policies-title" className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
			<h2 id="operator-policies-title" className="text-xl font-bold text-[#111111] sm:text-2xl">
				Politiques & contact
			</h2>

			<div className="mt-6 grid gap-6 md:grid-cols-2">
				{hasStations ? (
					<div className="rounded-2xl border border-[#E8E9EC] bg-white p-5">
						<div className="flex items-center gap-2">
							<MapPin className="h-5 w-5 text-[#6C8D26]" aria-hidden />
							<h3 className="font-bold text-[#111111]">Gares & terminaux</h3>
						</div>
						<ul className="mt-3 space-y-2 text-sm text-[#505050]">
							{stations.map((s) => (
								<li key={s}>• {s}</li>
							))}
						</ul>
					</div>
				) : null}

				{hasPolicies ? (
					<div className="rounded-2xl border border-[#E8E9EC] bg-white p-5">
						<div className="flex items-center gap-2">
							{bagages ? (
								<Luggage className="h-5 w-5 text-[#6C8D26]" aria-hidden />
							) : (
								<Ticket className="h-5 w-5 text-[#6C8D26]" aria-hidden />
							)}
							<h3 className="font-bold text-[#111111]">Bagages & annulation</h3>
						</div>
						<ul className="mt-4 flex flex-wrap gap-2">
							{policyBadges.map((label) => (
								<li
									key={label}
									className="inline-flex items-center rounded-full border border-[#E8E9EC] bg-[#FAFAFA] px-3.5 py-1.5 text-sm font-medium text-[#303030]"
								>
									{label}
								</li>
							))}
						</ul>
					</div>
				) : null}

				{hasContact ? (
					<div className="rounded-2xl border border-[#E8E9EC] bg-white p-5 md:col-span-2">
						<div className="flex items-center gap-2">
							<Phone className="h-5 w-5 text-[#6C8D26]" aria-hidden />
							<h3 className="font-bold text-[#111111]">Contact & support</h3>
						</div>
						<p className="mt-3 text-sm text-[#505050]">
							{supportPhone ? (
								<>
									Téléphone :{" "}
									<a className="font-semibold text-[#303030] underline" href={`tel:${supportPhone}`}>
										{supportPhone}
									</a>
								</>
							) : null}
							{supportPhone && supportEmail ? " · " : null}
							{supportEmail ? (
								<>
									Email :{" "}
									<a
										className="font-semibold text-[#303030] underline"
										href={`mailto:${supportEmail}`}
									>
										{supportEmail}
									</a>
								</>
							) : null}
						</p>
					</div>
				) : null}
			</div>
		</section>
	);
}
