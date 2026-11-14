"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import "dayjs/locale/fr";
import dayjs from "dayjs";
import {
	Bus,
	Lock,
	Luggage,
	MessageSquareText,
	Minus,
	Plus,
	Zap,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";
import {
	getAttrValue,
	getTripInformation,
} from "@/lib/attribute";
import {
	type CheckoutErrorFragment,
	type CheckoutFragment,
	type MoneyFragment,
} from "@/gql/graphql";
import { ProductImageWrapper } from "@/ui/atoms/ProductImageWrapper";
import { CheckoutLink } from "@/app/[channel]/(main)/cart/CheckoutLink";
import { updateLineFromCheckout } from "@/actions/";
import { useAvailability } from "@/context/AvailabilityGuardContext";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";
import { type OperatorCardMeta } from "@/lib/loadOperatorLogoMap";
import {
	getTripLineQuantity,
	getTripLines,
} from "@/lib/ensurePlatformFeeInCheckout";

const BRAND_GREEN = "#A6C65A";

interface CartProps {
	checkout: CheckoutFragment;
	operatorMeta?: OperatorCardMeta | null;
}

function stationWithCity(station?: string | null, city?: string | null): string {
	const s = (station || "").trim();
	const c = (city || "").trim();
	if (!s && !c) return "—";
	if (!s) return c;
	if (!c) return s.split(",")[0]?.trim() || s;
	const short = s.split(",")[0]?.trim() || s;
	if (short.toLowerCase().includes(c.toLowerCase())) return short;
	return `${short} (${c})`;
}

function parseNumeric(raw?: string | null): number | null {
	if (!raw?.trim()) return null;
	const match = raw.replace(",", ".").match(/-?\d+(\.\d+)?/);
	if (!match) return null;
	const n = Number(match[0]);
	return Number.isFinite(n) ? n : null;
}

export const CartDetail = ({ checkout, operatorMeta }: CartProps) => {
	const tripLines = useMemo(() => getTripLines(checkout.lines), [checkout.lines]);
	const initialQty = getTripLineQuantity(checkout.lines);
	const [passengerCount, setPassengerCount] = useState<number>(initialQty);
	const [price, setPrice] = useState<MoneyFragment>(checkout.totalPrice.gross);
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<CheckoutErrorFragment[] | null>(null);

	const departLine = tripLines[0];
	const variant = departLine?.variant;
	const attributes = variant?.attributes || [];
	const { checkAvailability } = useAvailability();
	const ticketWord = passengerCount > 1 ? "tickets" : "ticket";

	const {
		departureCity,
		departureStation,
		arrivalCity,
		arrivalStation,
		company,
		departureTimeStr,
		readableDuration,
		arrivalTimeStr,
	} = getTripInformation({ attributes });

	const departureLabel = stationWithCity(departureStation, departureCity);
	const arrivalLabel = stationWithCity(arrivalStation, arrivalCity);

	const dateTimeRaw = getAttrValue(attributes, "departure-time");
	const fullDateLabel = useMemo(() => {
		if (!dateTimeRaw) return "";
		const d = dayjs(dateTimeRaw);
		if (!d.isValid()) return "";
		const label = d.locale("fr").format("dddd D MMMM YYYY");
		return label.charAt(0).toUpperCase() + label.slice(1);
	}, [dateTimeRaw]);

	const bags = parseNumeric(operatorMeta?.bagagesAllowed);
	const cancelHours = parseNumeric(operatorMeta?.cancellationHours);
	const logoUrl =
		operatorMeta?.logoUrl?.trim() || variant?.product?.thumbnail?.url?.trim() || "";

	const amount = price?.amount || 0;
	const currency = price?.currency || "";
	const unitAmount = passengerCount > 0 ? amount / passengerCount : amount;

	useEffect(() => {
		if (checkout) checkAvailability(checkout);
	}, [checkout, checkAvailability]);

	const handleQuantityUpdate = async (newQty: number) => {
		if (!variant?.id || !checkout?.id) return;
		const previousQty = passengerCount;
		setPassengerCount(newQty);
		setErrors(null);

		startTransition(async () => {
			try {
				const { errors: updateErrors, checkout: updated } = await updateLineFromCheckout({
					checkoutId: checkout.id,
					lines: [{ quantity: newQty, variantId: variant.id }],
				});

				if (updateErrors?.length) {
					setErrors(updateErrors);
					setPassengerCount(previousQty);
					return;
				}
				if (updated?.lines) {
					setPassengerCount(getTripLineQuantity(updated.lines));
				}
				if (updated?.totalPrice) {
					setPrice(updated.totalPrice.gross);
				}
			} catch (err) {
				console.error("Erreur updateLineFromCheckout:", err);
				setPassengerCount(previousQty);
			}
		});
	};

	return (
		<section className="bg-[#FAFAFA]">
			<div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
				<header className="mb-6">
					<h1 className="text-2xl font-bold tracking-tight text-[#111111] sm:text-3xl">
						Ma Réservation ({passengerCount} {ticketWord})
					</h1>
					<p className="mt-1 text-sm text-[#606060]">
						Étape 2 sur 3 : Vérification de votre trajet
					</p>
				</header>

				{/* Trip card */}
				<article className="rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
					<div className="flex flex-wrap items-center gap-2">
						<span
							className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold text-white"
							style={{ backgroundColor: BRAND_GREEN }}
						>
							<Bus className="h-3.5 w-3.5" aria-hidden />
							Aller
						</span>
						<p className="text-base font-bold text-[#111111]">
							{departureCity || "Départ"} → {arrivalCity || "Arrivée"}
						</p>
					</div>

					<p className="mt-2 text-sm text-[#606060]">
						{fullDateLabel ? (
							<>
								Date : <span className="font-medium text-[#303030]">{fullDateLabel}</span>
								{" · "}
							</>
						) : null}
						Compagnie :{" "}
						<span className="font-medium text-[#303030]">{company || "—"}</span>
					</p>

					{logoUrl ? (
						<div className="mt-3">
							<div className="relative h-8 w-8 overflow-hidden rounded-lg border border-[#E8E9EC] bg-white">
								<ProductImageWrapper
									src={logoUrl}
									alt={company || ""}
									width={64}
									height={64}
									className="h-8 w-8 object-contain"
									unoptimized
								/>
							</div>
						</div>
					) : null}

					<div className="mt-5 border-t border-[#F0F1F3] pt-5">
						<div className="relative pl-4">
							<span
								className="absolute left-0 top-2 h-2 w-2 rounded-full"
								style={{ backgroundColor: "#EB1700" }}
								aria-hidden
							/>
							<p className="text-lg font-bold tabular-nums text-[#111111]">{departureTimeStr}</p>
							<p className="text-sm text-[#505050]">{departureLabel}</p>
						</div>

						<div className="my-2 ml-[3px] border-l-2 border-dashed border-[#D5D6DB] py-2 pl-4">
							<p className="text-xs font-medium text-[#606060]">
								Durée estimée : {readableDuration || "—"}
							</p>
						</div>

						<div className="relative pl-4">
							<span
								className="absolute left-0 top-2 h-2 w-2 rounded-full border-2 bg-white"
								style={{ borderColor: BRAND_GREEN }}
								aria-hidden
							/>
							<p className="text-lg font-bold tabular-nums text-[#111111]">
								{arrivalTimeStr ?? "— —"}
							</p>
							<p className="text-sm text-[#505050]">{arrivalLabel}</p>
						</div>
					</div>

					<p className="mt-5 flex items-start gap-2 text-sm text-[#505050]">
						<Luggage className="mt-0.5 h-4 w-4 shrink-0" style={{ color: BRAND_GREEN }} />
						<span>
							{bags != null && bags > 0
								? `${bags} bagage${bags > 1 ? "s" : ""} en soute inclus (23 kg max)`
								: "1 bagage en soute inclus (23 kg max)"}
						</span>
					</p>

					{cancelHours != null ? (
						<p className="mt-2 text-sm text-[#505050]">
							{cancelHours <= 0
								? "Aucune annulation possible pour ce trajet."
								: `Annulation gratuite jusqu'à ${Math.round(cancelHours)}h avant le départ.`}
						</p>
					) : null}
				</article>

				{/* Passengers */}
				<section className="mt-5 rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
					<h2 className="text-sm font-bold uppercase tracking-wide text-[#606060]">Passagers</h2>
					<div className="mt-4 flex items-center justify-between gap-4">
						<p className="text-sm text-[#303030]">
							Nombre de passagers :{" "}
							<span className="font-bold text-[#111111]">{passengerCount}</span>
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => handleQuantityUpdate(passengerCount > 1 ? passengerCount - 1 : 1)}
								disabled={isPending || passengerCount <= 1}
								className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E3E7] bg-white hover:bg-[#F7F7F8] disabled:opacity-40"
								aria-label="Retirer un passager"
							>
								<Minus className="h-4 w-4" />
							</button>
							<span className="min-w-[1.5rem] text-center text-base font-bold">{passengerCount}</span>
							<button
								type="button"
								onClick={() => handleQuantityUpdate(passengerCount + 1)}
								disabled={isPending}
								className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E2E3E7] bg-white hover:bg-[#F7F7F8] disabled:opacity-40"
								aria-label="Ajouter un passager"
							>
								<Plus className="h-4 w-4" />
							</button>
						</div>
					</div>
					<button
						type="button"
						onClick={() => handleQuantityUpdate(passengerCount + 1)}
						disabled={isPending}
						className="mt-4 inline-flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
						style={{ color: BRAND_GREEN }}
					>
						<Plus className="h-4 w-4" />
						Ajouter un passager
					</button>
					{isPending ? (
						<div className="mt-3">
							<EllipsisLoader color={BRAND_GREEN} dotSize={6} />
						</div>
					) : null}
					{errors && errors.length > 0 ? (
						<div className="mt-3 text-sm text-[#EB1700]">
							{errors.map((e, idx) => (
								<div key={idx}>{e.message || "Erreur inconnue"}</div>
							))}
						</div>
					) : null}
				</section>

				{/* Price summary */}
				<section className="mt-5 rounded-2xl border border-[#E8E9EC] bg-white p-5 shadow-sm sm:p-6">
					<h2 className="text-sm font-bold uppercase tracking-wide text-[#606060]">
						Prix du billet
					</h2>
					<dl className="mt-4 space-y-3 text-sm">
						<div className="flex items-start justify-between gap-4">
							<dt className="text-[#505050]">
								Billet aller ({passengerCount}x passager{passengerCount > 1 ? "s" : ""})
								{passengerCount > 1 ? (
									<span className="mt-0.5 block text-xs text-[#9CA3AF]">
										{formatMoney(unitAmount, currency)} / passager
									</span>
								) : null}
							</dt>
							<dd className="font-semibold text-[#111111]">{formatMoney(amount, currency)}</dd>
						</div>
						<div className="border-t border-[#F0F1F3] pt-3">
							<div className="flex items-center justify-between gap-4">
								<dt className="font-bold text-[#111111]">Sous-total panier</dt>
								<dd className="text-lg font-bold" style={{ color: BRAND_GREEN }}>
									{formatMoney(amount, currency)}
								</dd>
							</div>
						</div>
					</dl>

					<p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#606060]">
						<MessageSquareText className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: BRAND_GREEN }} />
						E-billet envoyé immédiatement par SMS et WhatsApp après paiement.
					</p>

					<div className="mt-5">
						<CheckoutLink
							checkoutId={checkout.id}
							lines={checkout.lines}
							disabled={!tripLines.length || isPending}
							className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-5 text-sm font-bold normal-case tracking-normal text-white transition hover:bg-[#c91400] disabled:bg-neutral-300"
						/>
					</div>

					<p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[#606060]">
						<Zap className="h-3.5 w-3.5" style={{ color: BRAND_GREEN }} aria-hidden />
						Validation instantanée · Paiement Wave, Orange Money, MTN, Moov
					</p>
					<p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#9CA3AF]">
						<Lock className="h-3 w-3" aria-hidden />
						Paiement sécurisé — le total final s&apos;affiche à l&apos;étape suivante
					</p>
				</section>
			</div>
		</section>
	);
};
