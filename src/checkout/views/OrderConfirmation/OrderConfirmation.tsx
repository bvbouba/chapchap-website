"use client";

import { useMemo } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import {
	Bus,
	Calendar,
	CheckCircle2,
	Clock,
	Download,
	MapPin,
	MessageCircle,
	Printer,
	ShieldCheck,
} from "lucide-react";
import { useOrder } from "@/checkout/hooks/useOrder";
import { getTripInformation } from "@/lib/attribute";
import {
	formatCheckoutMoney,
	getCheckoutTripLines,
	isCheckoutPlatformFeeLine,
	summarizeCheckoutPricing,
} from "@/checkout/lib/checkoutPricing";
import { getConfirmationCode } from "@/checkout/lib/generateShortCode";
import { getBookingBadge, isTicketUnlocked } from "@/lib/bookingStatus";
import { EllipsisLoader } from "@/ui/components/EllipsisLoader";

dayjs.locale("fr");

function formatLongFrenchDate(d: Date | null | undefined): string {
	if (!d || Number.isNaN(d.getTime())) return "";
	const raw = dayjs(d).locale("fr").format("dddd D MMMM YYYY");
	return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function formatPhoneDisplay(raw?: string | null): string {
	const digits = (raw || "").replace(/\D/g, "");
	if (!digits) return "";
	let national = digits.startsWith("225") ? digits.slice(3) : digits;
	if (national.length === 9) national = `0${national}`;
	if (national.length < 8) return raw?.startsWith("+") ? raw : `+${digits}`;
	const parts = [
		national.slice(0, 2),
		national.slice(2, 4),
		national.slice(4, 6),
		national.slice(6, 8),
		national.slice(8, 10),
	].filter(Boolean);
	return `+225 ${parts.join(" ")}`;
}

function isGeneratedTicketEmail(email?: string | null): boolean {
	if (!email) return true;
	return (
		email.endsWith("@chapchapticket.com") ||
		email.endsWith("@chapchap.ci") ||
		email === "anonymous@chapchapticket.com"
	);
}

function parsePassengerNames(note?: string | null): string[] {
	if (!note?.trim()) return [];
	return note
		.split(";")
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const [lastName, firstName] = block.split(",").map((p) => p.trim());
			return `${firstName || ""} ${lastName || ""}`.trim();
		})
		.filter(Boolean);
}

function boardingTimeLabel(departureDate: Date | null | undefined): string {
	if (!departureDate || Number.isNaN(departureDate.getTime())) return "";
	const boarding = new Date(departureDate.getTime() - 30 * 60_000);
	return boarding.toLocaleTimeString("fr-FR", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

function TicketQr({ value }: { value: string }) {
	const src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(value)}`;
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt={`Code QR réservation ${value}`}
			width={180}
			height={180}
			className="mx-auto rounded-lg border border-[#E8E9EC] bg-white p-2"
		/>
	);
}

export const OrderConfirmation = () => {
	const { order, loading } = useOrder();

	const tripLine = useMemo(() => {
		if (!order?.lines?.length) return null;
		return getCheckoutTripLines(order.lines)[0] ?? order.lines[0];
	}, [order]);

	const tripInfo = useMemo(
		() =>
			getTripInformation({
				attributes: (tripLine?.variant?.attributes || []) as never,
			}),
		[tripLine],
	);

	const pricing = useMemo(
		() => summarizeCheckoutPricing(order?.lines, order?.total?.gross?.amount),
		[order?.lines, order?.total?.gross?.amount],
	);

	if (loading && !order) {
		return (
			<div className="flex min-h-[40vh] items-center justify-center">
				<EllipsisLoader color="#EB1700" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="mx-auto max-w-lg py-16 text-center">
				<h1 className="text-2xl font-bold text-[#111111]">Commande introuvable</h1>
				<Link
					href="/"
					className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-[#EB1700] px-6 text-sm font-bold text-white"
				>
					Retour à l&apos;accueil
				</Link>
			</div>
		);
	}

	const confirmationCode = getConfirmationCode(order);
	const passengerNames = parsePassengerNames(order.customerNote);
	const phoneDisplay = formatPhoneDisplay(order.billingAddress?.phone);
	const longDate = formatLongFrenchDate(tripInfo.departureDate);
	const boardingTime = boardingTimeLabel(tripInfo.departureDate);
	const showRealEmail = !isGeneratedTicketEmail(order.userEmail);
	const feeLineAmount =
		order.lines?.find((l) => isCheckoutPlatformFeeLine(l))?.totalPrice?.gross?.amount ??
		pricing.feeAmount;
	const paidAmountLabel = formatCheckoutMoney(
		order.total?.gross?.amount ?? pricing.total,
		pricing.currency,
	);
	const bookingBadge = getBookingBadge({
		orderStatus: order.status,
		isPaid: order.isPaid,
		paymentStatus: order.paymentStatus,
		metadata: order.metadata,
		fulfillments: order.fulfillments,
		paidAmountLabel,
	});
	const ticketReady = isTicketUnlocked(order.status);

	const handlePrint = () => {
		window.print();
	};

	return (
		<main className="mx-auto max-w-3xl print:max-w-none">
			{/* Hero */}
			<header
				className={`rounded-2xl border px-5 py-6 text-center sm:px-8 ${
					ticketReady
						? "border-[#D8E8B8] bg-[#F4F9E8]"
						: "border-[#BFDBFE] bg-[#EFF6FF]"
				}`}
			>
				<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
					{ticketReady ? (
						<CheckCircle2 className="h-8 w-8 text-[#A6C65A]" aria-hidden />
					) : (
						<Clock className="h-8 w-8 text-[#1D4ED8]" aria-hidden />
					)}
				</div>
				<p
					className={`mt-4 text-xs font-bold uppercase tracking-wide ${
						ticketReady ? "text-[#3F5A1E]" : "text-[#1D4ED8]"
					}`}
				>
					{bookingBadge.label}
				</p>
				<h1
					className="mt-2 text-2xl font-bold text-[#111111] sm:text-3xl"
					data-testid="orderConfrmationTitle"
				>
					{ticketReady
						? "Votre billet est confirmé !"
						: "Paiement reçu — validation guichet"}
				</h1>
				<p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#505050]">
					{bookingBadge.message ||
						(ticketReady
							? "Votre billet a été émis avec succès."
							: "L'agent de guichet valide votre place. Votre billet final arrivera sous peu.")}
					{ticketReady && phoneDisplay ? (
						<>
							{" "}
							Un exemplaire vous a également été envoyé par{" "}
							<span className="font-semibold text-[#303030]">
								SMS & WhatsApp ({phoneDisplay})
							</span>
							.
						</>
					) : null}
				</p>
			</header>

			{/* E-ticket card */}
			<section className="mt-6 overflow-hidden rounded-2xl border border-[#E2E3E7] bg-white shadow-sm print:shadow-none">
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E9EC] bg-[#111111] px-5 py-3 text-white">
					<div className="flex items-center gap-2 text-sm font-bold">
						<Bus className="h-4 w-4 text-[#A6C65A]" aria-hidden />
						ChapChap Tickets
					</div>
					<p className="text-sm">
						Code réservation : <span className="font-bold">#{confirmationCode}</span>
					</p>
				</div>

				<div className="space-y-5 p-5 sm:p-6">
					<p className="text-sm font-semibold text-[#606060]">
						Compagnie :{" "}
						<span className="font-bold text-[#111111]">{tripInfo.company || "—"}</span>
					</p>

					<div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
						<div>
							<p className="text-xl font-bold text-[#111111]">
								{tripInfo.departureCity || "Départ"}
							</p>
							<p className="mt-1 text-sm text-[#606060]">
								{(tripInfo.departureStation || "").split(",")[0] || "Gare de départ"}
							</p>
						</div>
						<div className="hidden text-center text-[#A6C65A] sm:block" aria-hidden>
							───────────────►
						</div>
						<div className="sm:text-right">
							<p className="text-xl font-bold text-[#111111]">
								{tripInfo.arrivalCity || "Arrivée"}
							</p>
							<p className="mt-1 text-sm text-[#606060]">
								{(tripInfo.arrivalStation || "").split(",")[0] || "Gare d'arrivée"}
							</p>
						</div>
					</div>

					<div className="grid gap-3 rounded-xl bg-[#FAFAFA] p-4 text-sm sm:grid-cols-2">
						<p className="flex items-start gap-2 text-[#404040]">
							<Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#A6C65A]" />
							<span>
								<span className="font-semibold text-[#111111]">Date de départ :</span>
								<br />
								{longDate || tripInfo.formattedDate || "—"}
							</span>
						</p>
						<p className="flex items-start gap-2 text-[#404040]">
							<Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#A6C65A]" />
							<span>
								<span className="font-semibold text-[#111111]">Heure d&apos;embarquement :</span>
								<br />
								{boardingTime || "—"}{" "}
								{tripInfo.departureTimeStr
									? `(Départ strict à ${tripInfo.departureTimeStr})`
									: null}
							</span>
						</p>
					</div>

					<div>
						<p className="text-sm font-bold text-[#111111]">
							Passagers ({passengerNames.length || pricing.passengerCount})
						</p>
						<ul className="mt-2 space-y-1 text-sm text-[#505050]">
							{(passengerNames.length
								? passengerNames
								: Array.from({ length: pricing.passengerCount }, (_, i) => `Passager ${i + 1}`)
							).map((name, i) => (
								<li key={`${name}-${i}`}>
									{i + 1}. {name}
								</li>
							))}
						</ul>
					</div>

					<div className="border-t border-dashed border-[#E2E3E7] pt-5 text-center">
						{ticketReady ? (
							<>
								<TicketQr value={`CHAPCHAP-${confirmationCode}-${order.number}`} />
								<p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-[#606060]">
									Présentez ce QR code, votre SMS ou le n°{" "}
									<strong>#{confirmationCode}</strong> au chef de gare pour embarquer.
								</p>
							</>
						) : (
							<div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-5">
								<p className="text-sm font-bold text-[#1D4ED8]">QR code bientôt disponible</p>
								<p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#1E3A8A]">
									Conservez votre n° de réservation <strong>#{confirmationCode}</strong>. Le
									billet et QR code s&apos;activeront dès validation par le guichet.
								</p>
							</div>
						)}
					</div>
				</div>
			</section>

			{/* Actions */}
			<div className="mt-4 flex flex-wrap gap-3 print:hidden">
				{ticketReady ? (
					<>
						<button
							type="button"
							onClick={handlePrint}
							className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E3E7] bg-white px-4 text-sm font-semibold text-[#111111] hover:bg-[#F7F7F8] sm:flex-none"
						>
							<Printer className="h-4 w-4" />
							Imprimer
						</button>
						<button
							type="button"
							onClick={handlePrint}
							className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#E2E3E7] bg-white px-4 text-sm font-semibold text-[#111111] hover:bg-[#F7F7F8] sm:flex-none"
						>
							<Download className="h-4 w-4" />
							Télécharger (PDF)
						</button>
						{phoneDisplay ? (
							<a
								href={`https://wa.me/${(order.billingAddress?.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour, voici mon billet ChapChap #${confirmationCode}`)}`}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-white hover:opacity-95 sm:flex-none"
							>
								<MessageCircle className="h-4 w-4" />
								Renvoyer sur WhatsApp
							</a>
						) : null}
					</>
				) : (
					<Link
						href="/ci/orders"
						className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#EB1700] px-4 text-sm font-semibold text-white hover:bg-[#c91400] sm:flex-none"
					>
						Suivre dans Mes Voyages
					</Link>
				)}
			</div>

			{/* Boarding instructions */}
			<section className="mt-6 rounded-2xl border border-[#E8E9EC] bg-white p-5 sm:p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-[#111111]">
					<MapPin className="h-4 w-4 text-[#EB1700]" />
					Consignes pour le départ
				</h2>
				<ul className="mt-3 space-y-2 text-sm leading-6 text-[#505050]">
					<li>
						<strong>Heure d&apos;arrivée à la gare :</strong> présentez-vous au moins{" "}
						<strong>30 minutes avant le départ</strong>
						{boardingTime ? ` (${boardingTime})` : ""}.
					</li>
					<li>
						<strong>Pièce d&apos;identité :</strong> chaque passager doit présenter une pièce valide
						(CNI, Attestation, Passeport).
					</li>
					<li>
						<strong>Bagages :</strong> 1 bagage en soute inclus par passager (23 kg max).
					</li>
				</ul>
			</section>

			{/* Payment recap */}
			<section className="mt-5 rounded-2xl border border-[#E8E9EC] bg-white p-5 sm:p-6">
				<h2 className="flex items-center gap-2 text-base font-bold text-[#111111]">
					<ShieldCheck className="h-4 w-4 text-[#A6C65A]" />
					Récapitulatif du paiement
				</h2>
				<dl className="mt-4 space-y-2 text-sm">
					<div className="flex justify-between gap-4">
						<dt className="text-[#606060]">Méthode</dt>
						<dd className="font-medium text-[#303030]">Mobile Money (Wave / Orange / MTN)</dd>
					</div>
					<div className="flex justify-between gap-4">
						<dt className="text-[#606060]">
							{pricing.passengerCount}x Billet{pricing.passengerCount > 1 ? "s" : ""}
							{pricing.unitAmount
								? ` (${formatCheckoutMoney(pricing.unitAmount, pricing.currency)})`
								: ""}
						</dt>
						<dd className="font-medium text-[#303030]">
							{formatCheckoutMoney(pricing.ticketAmount, pricing.currency)}
						</dd>
					</div>
					<div className="flex justify-between gap-4">
						<dt className="text-[#606060]">Frais de service</dt>
						<dd className="font-medium text-[#303030]">
							{formatCheckoutMoney(feeLineAmount, pricing.currency)}
						</dd>
					</div>
					<div className="flex justify-between gap-4 border-t border-[#F0F1F3] pt-3">
						<dt className="font-bold text-[#111111]">Total payé</dt>
						<dd className="text-lg font-bold text-[#A6C65A]">
							{formatCheckoutMoney(order.total?.gross?.amount, order.total?.gross?.currency)}{" "}
							<span className="text-xs font-semibold text-[#606060]">(Payé avec succès)</span>
						</dd>
					</div>
					{showRealEmail ? (
						<div className="flex justify-between gap-4 pt-1">
							<dt className="text-[#606060]">E-mail</dt>
							<dd className="font-medium text-[#303030]">{order.userEmail}</dd>
						</div>
					) : phoneDisplay ? (
						<div className="flex justify-between gap-4 pt-1">
							<dt className="text-[#606060]">Livraison billet</dt>
							<dd className="font-medium text-[#303030]">WhatsApp / SMS : {phoneDisplay}</dd>
						</div>
					) : null}
				</dl>
			</section>

			{/* Support */}
			<section className="mt-5 rounded-2xl border border-[#E8E9EC] bg-[#FAFAFA] p-5 text-sm text-[#505050] sm:p-6">
				<h2 className="text-base font-bold text-[#111111]">Assistance & support</h2>
				<p className="mt-2">Une question sur votre départ ou un retard ?</p>
				<ul className="mt-3 space-y-1">
					<li>
						Support ChapChap :{" "}
						<a className="font-semibold text-[#EB1700] underline" href="/ci/contact-us">
							Nous contacter
						</a>
					</li>
					<li>
						Email :{" "}
						<a className="font-semibold text-[#EB1700] underline" href="mailto:support@chapchap.ci">
							support@chapchap.ci
						</a>
					</li>
				</ul>
			</section>

			<div className="mt-8 flex flex-wrap gap-3 print:hidden">
				<Link
					href="/"
					className="inline-flex h-12 items-center justify-center rounded-xl bg-[#EB1700] px-6 text-sm font-bold text-white hover:bg-[#c91400]"
				>
					Retour à l&apos;accueil
				</Link>
			</div>
		</main>
	);
};
