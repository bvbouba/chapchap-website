import type { ComponentType } from "react";
import { AdyenDropIn } from "./AdyenDropIn/AdyenDropIn";
import { adyenGatewayId } from "./AdyenDropIn/types";
import { DummyComponent } from "./DummyDropIn/dummyComponent";
import { dummyGatewayId } from "./DummyDropIn/types";
import { StripeComponent } from "./StripeElements/stripeComponent";
import { stripeGatewayId } from "./StripeElements/types";
import { PaystackComponent } from "./Paystack/PaystackComponent";
import { paystackGatewayId } from "./Paystack/types";

export type PaymentMethodMap = Record<string, ComponentType<{ config?: unknown }>>;

/** Same gateway map as the customer mobile app. */
export const paymentMethodToComponent: PaymentMethodMap = {
	[adyenGatewayId]: AdyenDropIn as ComponentType<{ config?: unknown }>,
	[stripeGatewayId]: StripeComponent as ComponentType<{ config?: unknown }>,
	[dummyGatewayId]: DummyComponent as ComponentType<{ config?: unknown }>,
	[paystackGatewayId]: PaystackComponent as ComponentType<{ config?: unknown }>,
};

export function paystackPreferred(gatewayId: string): boolean {
	return gatewayId === paystackGatewayId || gatewayId.includes("paystack");
}
