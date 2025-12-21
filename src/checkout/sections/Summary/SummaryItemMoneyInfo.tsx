import React from "react";
import clsx from "clsx";
import { Money } from "@/checkout/components";
import { getFormattedMoney } from "@/checkout/lib/utils/money";
import { MoneyFragment } from "@/gql/graphql";

interface SummaryItemMoneyInfoProps {
	unitPrice: {
        __typename?: "TaxedMoney";
        gross: {
            __typename?: "Money";
            currency: string;
            amount: number;
        };
    };
	undiscountedUnitPrice: MoneyFragment;
	quantity: number;
}

export const SummaryItemMoneyInfo: React.FC<SummaryItemMoneyInfoProps> = ({
	unitPrice,
	quantity,
	undiscountedUnitPrice,
}) => {
	const multiplePieces = quantity > 1;
	const piecePrice = unitPrice.gross;
	const onSale = undiscountedUnitPrice.amount !== unitPrice.gross.amount;
	return (
		<div className="flex flex-col items-end justify-end">
			<div className="flex flex-row flex-wrap justify-end gap-x-2">
				{onSale && (
					<Money
						ariaLabel="undiscounted price"
						money={{
							currency: undiscountedUnitPrice.currency,
							amount: undiscountedUnitPrice.amount * quantity,
						}}
						className="line-through"
					/>
				)}
				<Money
					ariaLabel="total price"
					money={{
						currency: piecePrice?.currency,
						amount: (piecePrice?.amount || 0) * quantity,
					}}
					className={clsx({
						"!text-text-error": onSale,
					})}
				/>
			</div>

			{multiplePieces && (
				<p aria-label="single piece price" color="secondary" className="text-end text-[10px]">
					{getFormattedMoney(piecePrice)} chacun
				</p>
			)}
		</div>
	);
};
