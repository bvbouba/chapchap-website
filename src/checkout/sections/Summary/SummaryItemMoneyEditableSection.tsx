import { type CheckoutLineFragment } from "@/checkout/graphql";

import { Skeleton } from "@/checkout/components";
import { SummaryItemMoneyInfo } from "@/checkout/sections/Summary/SummaryItemMoneyInfo";
import { useSummaryItemForm } from "@/checkout/sections/Summary/useSummaryItemForm";

interface SummaryItemMoneyEditableSectionProps {
	line: CheckoutLineFragment;
}

export const SummaryItemMoneyEditableSection: React.FC<SummaryItemMoneyEditableSectionProps> = ({ line }) => {
	const { form } = useSummaryItemForm({ line });

	const { isSubmitting } = form;

	return (
		<div className="flex flex-col items-end gap-2">
			{isSubmitting ? (
				<div className="flex max-w-[6ch] flex-col">
					<Skeleton />
					<Skeleton />
				</div>
			) : (
				<SummaryItemMoneyInfo {...line} />
			)}
		</div>
	);
};
