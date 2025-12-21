import { type FC } from "react";
import clsx from "clsx";
import { SummaryItem, type SummaryLine } from "./SummaryItem";
import { PromoCodeAdd } from "./PromoCodeAdd";
import { SummaryPromoCodeRow } from "./SummaryPromoCodeRow";
import { SummaryItemMoneyEditableSection } from "./SummaryItemMoneyEditableSection";

import { Divider, Money, Title } from "@/checkout/components";
import {
	OrderLineFragment,
	type CheckoutLineFragment,
	type GiftCardFragment,
} from "@/checkout/graphql";
import { SummaryItemMoneySection } from "@/checkout/sections/Summary/SummaryItemMoneySection";

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
		tax: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
	},
	subtotalPrice?: {
			__typename?: "TaxedMoney";
			gross: {
				__typename?: "Money";
				currency: string;
				amount: number;
			};
	}
	giftCards?: GiftCardFragment[];
	voucherCode?: string | null;
	discount?: {
		__typename?: "Money";
		currency: string;
		amount: number;
	} | undefined;
	shippingPrice: {
		__typename?: "TaxedMoney";
		gross: {
			__typename?: "Money";
			currency: string;
			amount: number;
		};
	}
}

export const Summary: FC<SummaryProps> = ({
	editable = true,
	lines,
	totalPrice,
	giftCards = [],
	voucherCode,
	discount,
}) => {
	return (
		<div
			className={clsx(
				"z-0 flex h-fit w-full flex-col",
				"before:fixed before:bottom-0 before:left-1/2 before:top-0 before:-z-10 before:w-1/2 before:border-l before:border-neutral-200 before:bg-neutral-50 before:content-none before:lg:content-['']",
			)}
		>
			<details open className="group">
				<summary className="-mb-2 flex cursor-pointer flex-row items-center">
					<Title className="text-xl">Résumé du voyage</Title>
					{/* <ChevronDownIcon className="mb-2 group-open:rotate-180" /> */}
				</summary>
				<ul className="py-2" data-testid="SummaryProductList">
					{lines.map((line) => (
						<SummaryItem line={line} key={line?.id}>
							{editable ? (
								<SummaryItemMoneyEditableSection line={line as CheckoutLineFragment} />
							) : (
								<SummaryItemMoneySection line={line as OrderLineFragment} />
							)}
						</SummaryItem>
					))}
				</ul>
			</details>
			{editable && (
				<>
					<PromoCodeAdd />
					<Divider />
				</>
			)}
			<div className="mt-4 flex max-w-full flex-col">
				{/* <SummaryMoneyRow label="Subtotal" money={subtotalPrice?.gross} ariaLabel="subtotal price" /> */}
				{voucherCode && (
					<SummaryPromoCodeRow
						editable={editable}
						promoCode={voucherCode}
						ariaLabel="voucher"
						label={`Voucher code: ${voucherCode}`}
						money={discount}
						negative
					/>
				)}
				{giftCards.map(({ currentBalance, displayCode, id }) => (
					<SummaryPromoCodeRow
						key={id}
						editable={editable}
						promoCodeId={id}
						ariaLabel="gift card"
						label={`Gift Card: •••• •••• ${displayCode}`}
						money={currentBalance}
						negative
					/>
				))}
				{/* <SummaryMoneyRow label="Shipping cost" ariaLabel="shipping cost" money={shippingPrice?.gross} /> */}
				<Divider className="my-4" />
				<div className="flex flex-row items-baseline justify-between pb-4">
					<div className="flex flex-row items-baseline">
						<p className="">Total du voyage</p>
						{/* <p color="secondary" className="ml-2">
							includes {getFormattedMoney(totalPrice?.tax)} tax
						</p> */}
					</div>
					<Money ariaLabel="total price" money={totalPrice?.gross} data-testid="totalOrderPrice" />
				</div>
			</div>
		</div>
	);
};
