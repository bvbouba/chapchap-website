"use client";

import { useState } from "react";
import { Calendar, Clock, MessageCircle, Ticket, Users, CreditCard } from "lucide-react";
import { LinkWithChannel } from "@/ui/atoms/LinkWithChannel";
import { getTripInformation } from "@/lib/attribute";
import { getConfirmationCode } from "@/checkout/lib/generateShortCode";
import { getBookingBadge, isTicketUnlocked } from "@/lib/bookingStatus";
import {
	formatLongFrenchDate,
	formatVoyageMoney,
	getPrimaryTicketLine,
	parsePassengerNames,
	paymentMethodLabel,
	periodOfDayLabel,
	resolveOrderTotal,
	type VoyageOrder,
} from "@/lib/voyageOrders";
import { OperatorLogo } from "./OperatorLogo";
import { shareTicketPdfOnWeb } from "@/lib/shareTicketPdf";
import { formatTripNumberLabel } from "@/lib/tripNumber";

type Props = {
	order: VoyageOrder;
	operatorLogoUrl?: string | null;
};

export function VoyageTicketCard({ order, operatorLogoUrl }: Props) {
	const [sharingPdf, setSharingPdf] = useState(false);
	const line = getPrimaryTicketLine(order);
	const attributes = (line?.variant?.attributes || []) as Parameters<
		typeof getTripInformation
	>[0]["attributes"];
	const trip = getTripInformation({ attributes });
	const total = resolveOrderTotal(order);
	const paidAmountLabel = formatVoyageMoney(total.amount, total.currency);
	const badge = getBookingBadge({
		orderStatus: order.status,
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		metadata: order.metadata,
		fulfillments: order.fulfillments,
		paidAmountLabel,
	});
	const passengers = parsePassengerNames({
		metadata: order.metadata,
		customerNote: order.customerNote,
	});
	const passengerCount =
		passengers.length ||
		(line?.quantity && line.quantity > 0 ? line.quantity : 1);
	const method = paymentMethodLabel(order);
	const confirmationCode = getConfirmationCode(order);
	const period = periodOfDayLabel(trip.departureDate);
	const isPaid =
		badge.phase === "awaiting_guichet" ||
		badge.phase === "issued" ||
		badge.phase === "boarded";
	const isCancelled = badge.phase === "cancelled" || badge.phase === "rejected";
	const ticketReady = isTicketUnlocked(order.status);
	const detailsHref = `/orders/${encodeURIComponent(order.id)}`;
	const tripIdLabel = line?.variant?.id ? formatTripNumberLabel(line.variant.id) : null;

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
				departureDateLabel: formatLongFrenchDate(trip.departureDate),
				departureTimeStr: trip.departureTimeStr,
				departureStation: trip.departureStation,
				arrivalStation: trip.arrivalStation,
				arrivalTimeStr: trip.arrivalTimeStr,
				company: trip.company,
				passengers: passengers.length > 0 ? passengers : undefined,
				tripIdLabel,
				totalLabel: paidAmountLabel,
			});
		} finally {
			setSharingPdf(false);
		}
	};

	return (
		<article className="overflow-hidden rounded-2xl border border-[#E2E3E7] bg-white shadow-sm">
			<div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F0F0F2] px-5 py-4 sm:px-6">
				<div className="flex min-w-0 items-center gap-2.5">
					<OperatorLogo
						logoUrl={operatorLogoUrl || line?.variant?.product?.thumbnail?.url}
						alt={trip.company || "Opérateur"}
						size={36}
					/>
					<div className="min-w-0">
						<p className="truncate text-sm font-bold uppercase tracking-wide text-[#111111]">
							{trip.company || line?.variant?.product?.name || "Transport"}
						</p>
						<p className="text-xs text-[#606060]">N° Billet : #{order.number || "—"}</p>
					</div>
				</div>
				<span
					className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${badge.className}`}
				>
					{badge.label}
				</span>
			</div>

			<div className="px-5 py-5 sm:px-6">
				<div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2 sm:gap-4">
					<div className="min-w-0">
						<p className="text-lg font-bold text-[#111111] sm:text-xl">
							{trip.departureCity || "Départ"}
						</p>
						{trip.departureStation ? (
							<p className="mt-0.5 text-xs leading-4 text-[#606060]">{trip.departureStation}</p>
						) : null}
					</div>
					<div className="flex flex-col items-center pt-2">
						<span className="h-px w-8 bg-[#D7D8DB] sm:w-16" aria-hidden />
						<span className="mt-1 text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
							➔
						</span>
					</div>
					<div className="min-w-0 text-right">
						<p className="text-lg font-bold text-[#111111] sm:text-xl">
							{trip.arrivalCity || "Arrivée"}
						</p>
						{trip.arrivalStation ? (
							<p className="mt-0.5 text-xs leading-4 text-[#606060]">{trip.arrivalStation}</p>
						) : null}
					</div>
				</div>

				<div className="mt-5 grid gap-3 sm:grid-cols-2">
					<div className="flex items-start gap-2 text-sm text-[#303030]">
						<Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
						<span>{formatLongFrenchDate(trip.departureDate)}</span>
					</div>
					<div className="flex items-start gap-2 text-sm text-[#303030]">
						<Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
						<span>
							{trip.departureTimeStr}
							{period ? <span className="text-[#606060]"> ({period})</span> : null}
						</span>
					</div>
					<div className="flex items-start gap-2 text-sm text-[#303030]">
						<Users className="mt-0.5 h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
						<span>
							{passengerCount} passager{passengerCount > 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex items-start gap-2 text-sm text-[#303030]">
						<CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#606060]" aria-hidden />
						<span>
							{paidAmountLabel}
							{method ? <span className="text-[#606060]"> · {method}</span> : null}
							{isPaid ? <span className="text-[#606060]"> · Payé</span> : null}
						</span>
					</div>
				</div>

				<p className="mt-4 text-xs text-[#606060]">
					Code confirmation :{" "}
					<span className="font-bold text-[#111111]">{confirmationCode}</span>
				</p>
			</div>

			<div className="border-t border-dashed border-[#E2E3E7] bg-[#FAFAFA] px-5 py-4 sm:px-6">
				{isCancelled ? (
					<p className="text-sm text-[#606060]">
						{badge.message || "Cette réservation a été annulée."}
					</p>
				) : isPaid ? (
					<div className="space-y-3">
						{badge.phase === "awaiting_guichet" && badge.message ? (
							<p className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2.5 text-sm text-[#1E3A8A]">
								{badge.message}
							</p>
						) : null}
						<div className="flex flex-col gap-2.5 sm:flex-row">
							<LinkWithChannel
								href={detailsHref}
								className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white hover:bg-[#c91400]"
							>
								<Ticket className="h-4 w-4" aria-hidden />
								{ticketReady ? "Voir le détail / QR Code" : "Voir le détail"}
							</LinkWithChannel>
							{ticketReady ? (
								<button
									type="button"
									disabled={sharingPdf}
									onClick={() => void onSharePdf()}
									className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#D7D8DB] bg-white px-4 text-sm font-bold text-[#111111] hover:bg-[#F7F7F8] disabled:opacity-70"
								>
									<MessageCircle className="h-4 w-4 text-[#25D366]" aria-hidden />
									{sharingPdf ? "PDF…" : "Partager PDF"}
								</button>
							) : null}
						</div>
					</div>
				) : (
					<div className="space-y-3">
						<p className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2.5 text-sm text-[#92400E]">
							{badge.message ||
								"Paiement non finalisé. Le billet n'est pas encore garanti."}
						</p>
						<div className="flex flex-col gap-2.5 sm:flex-row">
							<LinkWithChannel
								href="/"
								className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#EB1700] px-4 text-sm font-bold text-white hover:bg-[#c91400]"
							>
								Rechercher un trajet
							</LinkWithChannel>
							<LinkWithChannel
								href={detailsHref}
								className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-[#D7D8DB] bg-white px-4 text-sm font-bold text-[#111111] hover:bg-[#F7F7F8]"
							>
								Voir le détail
							</LinkWithChannel>
						</div>
					</div>
				)}
			</div>
		</article>
	);
}
