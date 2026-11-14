"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
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
import { getBookingBadge, isTicketUnlocked } from "@/lib/bookingStatus";
import { shareTicketPdfOnWeb } from "@/lib/shareTicketPdf";
import { OperatorLogo } from "./OperatorLogo";

type Props = {
	order: VoyageOrder;
	operatorLogoUrl?: string | null;
	onClose: () => void;
};

function qrUrl(value: string): string {
	return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(value)}`;
}

export function ETicketModal({ order, operatorLogoUrl, onClose }: Props) {
	const [sharingPdf, setSharingPdf] = useState(false);
	const line = getPrimaryTicketLine(order);
	const attributes = (line?.variant?.attributes || []) as Parameters<
		typeof getTripInformation
	>[0]["attributes"];
	const trip = getTripInformation({ attributes });
	const total = resolveOrderTotal(order);
	const badge = getBookingBadge({
		orderStatus: order.status,
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		metadata: order.metadata,
		fulfillments: order.fulfillments,
		paidAmountLabel: formatVoyageMoney(total.amount, total.currency),
	});
	const confirmationCode = getConfirmationCode(order);
	const method = paymentMethodLabel(order);
	const tripIdLabel = line?.variant?.id ? formatTripNumberLabel(line.variant.id) : null;
	const ticketCount = getTicketLines(order).reduce((sum, l) => sum + (l.quantity || 0), 0);
	const passengers = parsePassengerNames({
		metadata: order.metadata,
		customerNote: order.customerNote,
	});
	const passengerLabel =
		passengers.length > 0
			? passengers.join(", ")
			: `${Math.max(ticketCount, 1)} passager${ticketCount > 1 ? "s" : ""}`;
	const ticketReady = isTicketUnlocked(order.status);

	const qrPayload = `CHAPCHAP-${confirmationCode}-${order.number || ""}`;

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
				totalLabel: formatVoyageMoney(total.amount, total.currency),
			});
		} finally {
			setSharingPdf(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center">
			<div
				role="dialog"
				aria-modal="true"
				aria-label="E-billet"
				className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F1F1] text-[#111111] hover:bg-[#E5E5E5]"
					aria-label="Fermer"
				>
					<X className="h-5 w-5" />
				</button>

				<div className="border-b border-dashed border-[#D7D8DB] px-6 pb-4 pt-6">
					<div className="flex items-start justify-between gap-3 pr-10">
						<div className="flex min-w-0 items-center gap-2.5">
							<OperatorLogo
								logoUrl={operatorLogoUrl || line?.variant?.product?.thumbnail?.url}
								alt={trip.company || "Opérateur"}
								size={40}
							/>
							<div className="min-w-0">
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-[#A6C65A]">
									ChapChap Tickets
								</p>
								<p className="mt-1 truncate text-base font-bold uppercase text-[#111111]">
									{trip.company || "Transport"}
								</p>
							</div>
						</div>
						<span
							className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${badge.className}`}
						>
							{badge.label}
						</span>
					</div>
				</div>

				<div className="flex flex-col items-center px-6 py-5">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src={qrUrl(qrPayload)}
						alt={`QR code billet ${confirmationCode}`}
						width={200}
						height={200}
						className="rounded-xl border border-[#E8E9EC] bg-white p-2"
					/>
					<p className="mt-3 text-sm font-bold text-[#111111]">#{confirmationCode}</p>
					<p className="mt-1 text-xs text-[#606060]">Présentez le QR code au contrôle</p>
				</div>

				<div className="space-y-2.5 border-t border-dashed border-[#D7D8DB] px-6 py-5 text-sm">
					<p className="font-bold text-[#111111]">
						{trip.departureCity || "Départ"} → {trip.arrivalCity || "Arrivée"}
					</p>
					<p className="text-[#606060]">
						{formatLongFrenchDate(trip.departureDate)} · {trip.departureTimeStr}
					</p>
					{order.created ? (
						<p className="text-[#606060]">
							Acheté le : {formatLongFrenchDate(new Date(order.created))}
						</p>
					) : null}
					{trip.departureStation ? (
						<p className="text-[#606060]">Départ : {trip.departureStation}</p>
					) : null}
					{trip.arrivalStation ? (
						<p className="text-[#606060]">Arrivée : {trip.arrivalStation}</p>
					) : null}
					<p className="text-[#606060]">Passagers : {passengerLabel}</p>
					{tripIdLabel ? <p className="text-[#606060]">Trajet : {tripIdLabel}</p> : null}
					<p className="text-[#606060]">N° Billet : #{order.number || "—"}</p>
					<p className="font-semibold text-[#111111]">
						{formatVoyageMoney(total.amount, total.currency)}
						{method ? (
							<span className="font-normal text-[#606060]"> · {method}</span>
						) : null}
					</p>
				</div>

				{ticketReady ? (
					<div className="border-t border-[#E8E9EC] px-6 py-4">
						<button
							type="button"
							disabled={sharingPdf}
							onClick={() => void onSharePdf()}
							className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white hover:bg-[#1ebe57] disabled:opacity-70"
						>
							<MessageCircle className="h-5 w-5" aria-hidden />
							{sharingPdf ? "Préparation du PDF…" : "Partager le billet PDF"}
						</button>
					</div>
				) : null}
			</div>
		</div>
	);
}
