"use client";

import { useMemo, useState } from "react";
import {
	ArrowLeft,
	Bus,
	Calendar,
	ChevronDown,
	Clock,
	CreditCard,
	Lock,
	MapPin,
	MessageCircle,
	Smartphone,
	Ticket,
	User,
} from "lucide-react";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { getTripInformation } from "@/lib/attribute";
import { getConfirmationCode } from "@/checkout/lib/generateShortCode";
import { formatTripNumberLabel } from "@/lib/tripNumber";
import {
	formatLongFrenchDate,
	formatVoyageMoney,
	getPrimaryTicketLine,
	getTicketLines,
	parsePassengerNames,
	paymentMethodLabel,
	resolveOrderTotal,
	type VoyageOrder,
} from "@/lib/voyageOrders";
import { getBookingBadge, formatPaymentStatusLabelFr, isTicketUnlocked } from "@/lib/bookingStatus";
import { shareTicketPdfOnWeb } from "@/lib/shareTicketPdf";
import { ETicketModal } from "./ETicketModal";
import { OperatorLogo } from "./OperatorLogo";

type Props = {
	order: VoyageOrder;
	operatorLogoUrl?: string | null;
};

function paymentStatusLine(
	order: VoyageOrder,
	badge: ReturnType<typeof getBookingBadge>,
): string {
	const method = paymentMethodLabel(order);
	const paidLabel = formatPaymentStatusLabelFr({
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		paymentStatusDisplay: order.paymentStatusDisplay,
		authorizeStatus: order.authorizeStatus,
		chargeStatus: order.chargeStatus,
		metadata: order.metadata,
	});
	const statusLabel =
		paidLabel === "Payé" ? `${badge.label} · Payé` : `${badge.label} · ${paidLabel}`;
	return method ? `${statusLabel} (${method})` : statusLabel;
}

export function OrderDetailsView({ order, operatorLogoUrl }: Props) {
	const [ticketOpen, setTicketOpen] = useState(false);
	const [sharingPdf, setSharingPdf] = useState(false);

	const line = getPrimaryTicketLine(order);
	const attributes = (line?.variant?.attributes || []) as Parameters<
		typeof getTripInformation
	>[0]["attributes"];
	const trip = useMemo(() => getTripInformation({ attributes }), [attributes]);
	const total = resolveOrderTotal(order);
	const paidAmountLabel = formatVoyageMoney(total.amount, total.currency);
	const badge = getBookingBadge({
		orderStatus: order.status,
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		paymentStatusDisplay: order.paymentStatusDisplay,
		authorizeStatus: order.authorizeStatus,
		chargeStatus: order.chargeStatus,
		metadata: order.metadata,
		fulfillments: order.fulfillments,
		paidAmountLabel,
	});
	const confirmationCode = getConfirmationCode(order);
	const ticketReady = isTicketUnlocked(order.status);
	const tripIdLabel = line?.variant?.id ? formatTripNumberLabel(line.variant.id) : null;

	const ticketCount = getTicketLines(order).reduce((sum, l) => sum + (l.quantity || 0), 0);
	const namedPassengers = parsePassengerNames({
		metadata: order.metadata,
		customerNote: order.customerNote,
	});
	const passengers =
		namedPassengers.length > 0
			? namedPassengers
			: Array.from({ length: Math.max(ticketCount, 1) }, (_, i) =>
					ticketCount > 1 ? `Passager ${i + 1}` : "Passager",
				);

	const travelDateLabel = trip.departureDate
		? formatLongFrenchDate(trip.departureDate)
		: trip.formattedDate || "";

	const onSharePdf = async () => {
		if (!ticketReady || sharingPdf) return;
		setSharingPdf(true);
		try {
			await shareTicketPdfOnWeb({
				orderId: order.id,
				orderNumber: order.number,
				confirmationCode,
				departureCity: trip.departureCity,
				arrivalCity: trip.arrivalCity,
				departureDateLabel: travelDateLabel || null,
				departureTimeStr: trip.departureTimeStr,
				departureStation: trip.departureStation,
				arrivalStation: trip.arrivalStation,
				arrivalTimeStr: trip.arrivalTimeStr,
				company: trip.company,
				passengers,
				tripIdLabel,
				totalLabel: formatVoyageMoney(total.amount, total.currency),
			});
		} finally {
			setSharingPdf(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
			<header className="mb-6 flex items-center gap-3">
				<LinkWithChannel
					href="/orders"
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#D7D8DB] bg-white text-[#A6C65A] hover:bg-[#F7F7F8]"
					aria-label="Retour à Mes Voyages"
				>
					<ArrowLeft className="h-5 w-5" />
				</LinkWithChannel>
				<div>
					<h1 className="text-xl font-bold text-[#111111]">Détails du voyage</h1>
					<p className="text-sm text-[#606060]">Réservation et billet</p>
				</div>
			</header>

			<section className="mb-3.5 rounded-2xl border border-[#D7D8DB] bg-white p-5">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2.5">
						<OperatorLogo
							logoUrl={operatorLogoUrl || line?.variant?.product?.thumbnail?.url}
							alt={trip.company || "Opérateur"}
							size={36}
						/>
						<p className="truncate text-base font-bold uppercase text-[#111111]">
							{trip.company || "Transport"}
						</p>
					</div>
					<span
						className={`inline-flex max-w-[45%] items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${badge.className}`}
					>
						{badge.label}
					</span>
				</div>
				<p className="mt-3 flex items-center gap-2 text-sm text-[#606060]">
					<Ticket className="h-4 w-4 shrink-0" aria-hidden />
					Ref: {confirmationCode}
				</p>
				{tripIdLabel ? (
					<p className="mt-1.5 flex items-center gap-2 text-sm text-[#606060]">
						<Bus className="h-4 w-4 shrink-0" aria-hidden />
						Trajet: {tripIdLabel}
					</p>
				) : null}
				<p className="mt-1.5 text-xs text-[#808080]">N° Billet : #{order.number || "—"}</p>
			</section>

			<button
				type="button"
				disabled={!ticketReady}
				onClick={() => ticketReady && setTicketOpen(true)}
				className={`mb-2 flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-4 text-sm font-bold text-white transition ${
					ticketReady
						? "bg-[#EB1700] hover:bg-[#c91400]"
						: "cursor-not-allowed bg-[#9CA3AF]"
				}`}
			>
				{ticketReady ? (
					<Smartphone className="h-5 w-5" aria-hidden />
				) : (
					<Lock className="h-5 w-5" aria-hidden />
				)}
				{ticketReady
					? "Afficher mon billet / QR code"
					: badge.phase === "awaiting_guichet"
						? "En attente de validation guichet"
						: "Billet en attente de confirmation"}
			</button>
			{!ticketReady ? (
				<p className="mb-4 text-center text-xs leading-5 text-[#606060]">
					{badge.message ||
						`Votre billet et QR code seront disponibles dès que ${
							trip.company || "la compagnie"
						} aura validé votre réservation.`}
				</p>
			) : (
				<button
					type="button"
					disabled={sharingPdf}
					onClick={() => void onSharePdf()}
					className="mb-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] px-4 py-3 text-white transition hover:bg-[#1ebe57] disabled:opacity-70"
				>
					<MessageCircle className="h-5 w-5 shrink-0" aria-hidden />
					<span className="text-left">
						<span className="block text-sm font-bold uppercase tracking-wide">
							{sharingPdf ? "Préparation du PDF…" : "Partager le billet PDF"}
						</span>
						<span className="mt-0.5 block text-[11px] font-normal text-white/90">
							WhatsApp ou autre app — fichier PDF du billet
						</span>
					</span>
				</button>
			)}

			<section className="mb-3.5 rounded-2xl border border-[#D7D8DB] bg-white p-5">
				<h2 className="mb-4 text-base font-bold text-[#111111]">Itinéraire</h2>
				{travelDateLabel ? (
					<p className="mb-4 flex items-center gap-2 text-sm text-[#303030]">
						<Calendar className="h-4 w-4 text-[#606060]" aria-hidden />
						{travelDateLabel}
					</p>
				) : null}

				<div className="space-y-1">
					<div>
						<p className="flex items-center gap-2 text-sm font-bold text-[#111111]">
							<span className="h-2.5 w-2.5 rounded-full bg-[#A6C65A]" aria-hidden />
							{trip.departureTimeStr}
							{trip.departureCity ? ` • ${trip.departureCity}` : ""}
						</p>
						{trip.departureStation ? (
							<p className="ml-4 mt-1 flex items-start gap-1.5 text-xs text-[#606060]">
								<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
								{trip.departureStation}
							</p>
						) : null}
					</div>

					<div className="flex flex-col items-center py-2">
						<span className="h-6 w-px bg-[#D7D8DB]" aria-hidden />
						<span className="my-1 inline-flex items-center gap-1.5 rounded-full border border-[#E8E9EC] bg-[#F7F7F8] px-2.5 py-1 text-[11px] text-[#606060]">
							<Clock className="h-3.5 w-3.5" aria-hidden />
							Durée approx: {trip.readableDuration || "—"}
						</span>
						<ChevronDown className="h-4 w-4 text-[#A0A0A0]" aria-hidden />
					</div>

					<div>
						<p className="flex items-center gap-2 text-sm font-bold text-[#111111]">
							<span className="h-2.5 w-2.5 rounded-full bg-[#EB1700]" aria-hidden />
							{trip.arrivalTimeStr || "—"}
							{trip.arrivalCity ? ` • ${trip.arrivalCity}` : ""}
						</p>
						{trip.arrivalStation ? (
							<p className="ml-4 mt-1 flex items-start gap-1.5 text-xs text-[#606060]">
								<MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
								{trip.arrivalStation}
							</p>
						) : null}
					</div>
				</div>
			</section>

			<section className="mb-3.5 rounded-2xl border border-[#D7D8DB] bg-white p-5">
				<h2 className="mb-4 text-base font-bold text-[#111111]">
					Informations passager{passengers.length > 1 ? "s" : ""} ({passengers.length})
				</h2>
				<ul className="space-y-3">
					{passengers.map((name, i) => (
						<li key={`${name}-${i}`} className="flex items-center gap-2 text-sm">
							<User className="h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
							<span className="text-[#606060]">
								{passengers.length > 1 ? `Nom ${i + 1}:` : "Nom:"}
							</span>
							<span className="font-semibold text-[#111111]">{name}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="mb-3.5 rounded-2xl border border-[#D7D8DB] bg-white p-5">
				<h2 className="mb-4 text-base font-bold text-[#111111]">Paiement</h2>
				<div className="flex items-center gap-2 text-sm">
					<Calendar className="h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
					<span className="text-[#606060]">Achat:</span>
					<span className="font-semibold text-[#111111]">
						{formatLongFrenchDate(order.created ? new Date(order.created) : null)}
					</span>
				</div>
				<div className="mt-2.5 flex items-center gap-2 text-sm">
					<CreditCard className="h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
					<span className="text-[#606060]">Statut:</span>
					<span className="font-semibold text-[#111111]">
						{paymentStatusLine(order, badge)}
					</span>
				</div>
				<div className="mt-2.5 flex items-center gap-2 text-sm">
					<span className="inline-block h-4 w-4 shrink-0 text-center text-[#606060]">₣</span>
					<span className="text-[#606060]">Total:</span>
					<span className="font-bold text-[#111111]">
						{formatVoyageMoney(total.amount, total.currency)}
					</span>
				</div>
			</section>

			{ticketOpen ? (
				<ETicketModal
					order={order}
					operatorLogoUrl={operatorLogoUrl}
					onClose={() => setTicketOpen(false)}
				/>
			) : null}
		</div>
	);
}
