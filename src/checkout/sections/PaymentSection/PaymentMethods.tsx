"use client";

import { useMemo } from "react";
import { paymentMethodToComponent, paystackPreferred } from "./supportedPaymentApps";
import { PaymentSectionSkeleton } from "@/checkout/sections/PaymentSection/PaymentSectionSkeleton";
import { usePayments } from "@/checkout/sections/PaymentSection/usePayments";
import { useCheckoutUpdateState } from "@/checkout/state/updateStateStore";
import { PaystackComponent } from "./Paystack/PaystackComponent";
import { paystackGatewayId } from "./Paystack/types";
import { dummyGatewayId } from "./DummyDropIn/types";

export const PaymentMethods = () => {
	const { availablePaymentGateways, fetching } = usePayments();
	const {
		changingBillingCountry,
		updateState: { checkoutDeliveryMethodUpdate },
	} = useCheckoutUpdateState();

	const gatewaysWithDefinedComponent = useMemo(
		() => availablePaymentGateways.filter((gateway) => gateway.id in paymentMethodToComponent),
		[availablePaymentGateways],
	);

	/**
	 * Same as mobile: always prefer Paystack Mobile Money.
	 * Never fall back to Dummy (that was completing orders with one click).
	 */
	const preferredGateway = useMemo(() => {
		const paystack = gatewaysWithDefinedComponent.find(
			(g) => g.id === paystackGatewayId || paystackPreferred(g.id),
		);
		if (paystack) return paystack;

		const nonDummy = gatewaysWithDefinedComponent.find((g) => g.id !== dummyGatewayId);
		return nonDummy || null;
	}, [gatewaysWithDefinedComponent]);

	if (changingBillingCountry || fetching || checkoutDeliveryMethodUpdate === "loading") {
		return <PaymentSectionSkeleton />;
	}

	// Force Paystack MoMo UI even if gateway init list is empty/misconfigured —
	// transactionInitialize still targets chapchap.paystack like the mobile app.
	if (!preferredGateway || paystackPreferred(preferredGateway.id)) {
		return (
			<div className="gap-y-8">
				<PaystackComponent
					config={
						preferredGateway && paystackPreferred(preferredGateway.id)
							? preferredGateway
							: { id: paystackGatewayId }
					}
				/>
			</div>
		);
	}

	const Component = paymentMethodToComponent[preferredGateway.id];
	if (!Component) {
		return (
			<div className="gap-y-8">
				<PaystackComponent config={{ id: paystackGatewayId }} />
			</div>
		);
	}

	return (
		<div className="gap-y-8">
			<Component
				key={preferredGateway.id}
				config={preferredGateway}
			/>
		</div>
	);
};
