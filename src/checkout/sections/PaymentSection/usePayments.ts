import { useEffect } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { type PaymentStatus } from "@/checkout/sections/PaymentSection/types";
import { usePaymentGatewaysInitialize } from "@/checkout/sections/PaymentSection/usePaymentGatewaysInitialize";
import { usePaymentStatus } from "@/checkout/sections/PaymentSection/utils";

const paidStatuses: PaymentStatus[] = ["overpaid", "paidInFull", "authorized"];

export const usePayments = () => {
	const { checkout } = useCheckout();
	const paymentStatus = usePaymentStatus(checkout);

	const { fetching, availablePaymentGateways } = usePaymentGatewaysInitialize();

	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();

	useEffect(() => {
		// Gift-card / voucher fully covered checkouts (total 0) must be completed
		// explicitly from the form — do not auto-complete here.
		const due = checkout?.totalPrice?.gross?.amount ?? 0;
		if (due <= 0) return;

		// Only auto-complete when payment was actually captured/authorized (e.g. Paystack callback).
		if (!completingCheckout && paidStatuses.includes(paymentStatus)) {
			void onCheckoutComplete();
		}
	}, [
		checkout?.totalPrice?.gross?.amount,
		completingCheckout,
		onCheckoutComplete,
		paymentStatus,
	]);

	return { fetching, availablePaymentGateways };
};
