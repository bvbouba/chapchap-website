"use client";

import { type FC, useMemo } from "react";
import clsx from "clsx";
import { Lock, Zap } from "lucide-react";
import { PromoCodeAdd } from "./PromoCodeAdd";
import { SummaryPromoCodeRow } from "./SummaryPromoCodeRow";
import { Divider, Title } from "@/checkout/components";
import { type GiftCardFragment } from "@/checkout/graphql";
import { getTripInformation } from "@/lib/attribute";
import {
	formatCheckoutMoney,
	getCheckoutTripLines,
	summarizeCheckoutPricing,
} from "@/checkout/lib/checkoutPricing";
import { type SummaryLine } from "./SummaryItem";

interface SummaryProps {
	editable?: boolean;
	lines: SummaryLine[];
	totalPrice?: {
		__typename?: "TaxedMoney";
		gross: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
		tax?: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
	};
	subtotalPrice?: {
		__typename?: "TaxedMoney";
		gross: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
	};
	giftCards?: GiftCardFragment[];
	voucherCode?: string | null;
	discount?:
		| {
				__typename?: "Money";
				currency: string;
				amount: number;
		  }
		| undefined;
	shippingPrice?: {
		__typename?: "TaxedMoney";
		gross: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
	};
	/** Live passenger names from the form (optional). */
	passengerNames?: string[];
}

export const Summary: FC<SummaryProps> = ({
	editable = true,
	lines,
	totalPrice,
	giftCards = [],
	voucherCode,
	discount,
	passengerNames = [],
}) => {
	const tripLines = useMemo(() => getCheckoutTripLines(lines), [lines]);
	const tripLine = tripLines[0];
	const attributes = tripLine?.variant?.attributes || [];

	const {
		departureCity,
		arrivalCity,
		company,
		departureTimeStr,
		arrivalTimeStr,
		formattedDate,
		departureStation,
		arrivalStation,
	} = getTripInformation({ attributes: attributes as never });

	const pricing = summarizeCheckoutPricing(lines, totalPrice?.gross?.amount);
	const {
		passengerCount,
		ticketAmount,
		feeAmount,
		unitAmount,
		currency,
		total,
	} = pricing;

	const namedPassengers = passengerNames.filter(Boolean);

	return (
		<aside
			className={clsx(
				"z-0 flex h-fit w-full flex-col rounded-2xl border border-[#E8E9EC] bg-[#FAFAFA] p-5 sm:p-6",
				"lg:sticky lg:top-6",
			)}
		>
			<Title className="!mb-4 text-lg font-bold text-[#111111]">Résumé de la commande</Title>

			<div className="rounded-xl border border-[#E8E9EC] bg-white p-4">
				<p className="text-base font-bold text-[#111111]">
					{departureCity || "Départ"} → {arrivalCity || "Arrivée"}
				</p>
				<p className="mt-1 text-sm text-[#606060]">
					{[formattedDate, [departureTimeStr, arrivalTimeStr].filter(Boolean).join(" – ")]
						.filter(Boolean)
						.join(" · ")}
				</p>
				{company ? (
					<p className="mt-1 text-sm text-[#505050]">
						Compagnie : <span className="font-medium text-[#303030]">{company}</span>
					</p>
				) : null}
				{(departureStation || arrivalStation) && (
					<p className="mt-2 text-xs leading-5 text-[#808080]">
						{(departureStation || "").split(",")[0]} → {(arrivalStation || "").split(",")[0]}
					</p>
				)}
			</div>

			<div className="mt-4 border-t border-[#E8E9EC] pt-4">
				<p className="text-sm font-semibold text-[#303030]">
					{passengerCount} passager{passengerCount > 1 ? "s" : ""}
				</p>
				{namedPassengers.length > 0 ? (
					<ul className="mt-2 space-y-1 text-sm text-[#606060]">
						{namedPassengers.map((name, i) => (
							<li key={`${name}-${i}`}>
								• Passager {i + 1} : {name}
							</li>
						))}
					</ul>
				) : (
					<p className="mt-1 text-xs text-[#9CA3AF]">Noms à renseigner dans le formulaire</p>
				)}
			</div>

			<div className="mt-4 border-t border-[#E8E9EC] pt-4">
				<p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#606060]">
					Détail du prix
				</p>
				<dl className="space-y-2 text-sm">
					<div className="flex items-start justify-between gap-3">
						<dt className="text-[#505050]">
							{passengerCount}x Billet{passengerCount > 1 ? "s" : ""}
							{unitAmount > 0 ? (
								<span className="mt-0.5 block text-xs text-[#9CA3AF]">
									{formatCheckoutMoney(unitAmount, currency)} / un
								</span>
							) : null}
						</dt>
						<dd className="font-semibold text-[#111111]">
							{formatCheckoutMoney(ticketAmount, currency)}
						</dd>
					</div>
					<div className="flex items-start justify-between gap-3">
						<dt className="text-[#505050]">Frais de la plateforme</dt>
						<dd className="font-semibold text-[#111111]">
							{formatCheckoutMoney(feeAmount, currency)}
						</dd>
					</div>

					{voucherCode ? (
						<SummaryPromoCodeRow
							editable={editable}
							promoCode={voucherCode}
							ariaLabel="voucher"
							label={`Code promo : ${voucherCode}`}
							money={discount}
							negative
						/>
					) : null}
					{giftCards.map(({ currentBalance, displayCode, id }) => (
						<SummaryPromoCodeRow
							key={id}
							editable={editable}
							promoCodeId={id}
							ariaLabel="gift card"
							label={`Avoir : •••• ${displayCode}`}
							money={currentBalance}
							negative
						/>
					))}
				</dl>

				<Divider className="my-3" />

				<div className="flex items-baseline justify-between gap-3">
					<p className="text-base font-bold text-[#111111]">Total à payer</p>
					<p className="text-xl font-bold text-[#EB1700]" data-testid="totalOrderPrice">
						{formatCheckoutMoney(total, currency)}
					</p>
				</div>
			</div>

			{editable ? (
				<div className="mt-4">
					<p className="mb-2 text-xs font-medium text-[#606060]">Code promo / Carte cadeau</p>
					<PromoCodeAdd />
				</div>
			) : null}

			<div className="mt-5 space-y-2 border-t border-[#E8E9EC] pt-4 text-xs text-[#606060]">
				<p className="flex items-center gap-1.5">
					<Lock className="h-3.5 w-3.5 text-[#A6C65A]" aria-hidden />
					Paiement 100% sécurisé
				</p>
				<p className="flex items-center gap-1.5">
					<Zap className="h-3.5 w-3.5 text-[#A6C65A]" aria-hidden />
					Envoi instantané du billet par SMS & WhatsApp
				</p>
			</div>
		</aside>
	);
};
