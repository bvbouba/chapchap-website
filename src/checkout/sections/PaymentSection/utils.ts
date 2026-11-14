import { compact } from "lodash-es";
import { adyenGatewayId } from "./AdyenDropIn/types";
import { stripeGatewayId } from "./StripeElements/types";
import { dummyGatewayId } from "./DummyDropIn/types";
import { paystackGatewayId } from "./Paystack/types";
import {
	CheckoutAuthorizeStatusEnum,
	CheckoutChargeStatusEnum,
	type OrderAuthorizeStatusEnum,
	OrderChargeStatusEnum,
	type PaymentGateway,
} from "@/checkout/graphql";
import { type MightNotExist } from "@/checkout/lib/globalTypes";
import { getUrl } from "@/checkout/lib/utils/url";
import { type PaymentStatus } from "@/checkout/sections/PaymentSection/types";

export const supportedPaymentGateways = [
	paystackGatewayId,
	adyenGatewayId,
	stripeGatewayId,
	dummyGatewayId,
] as const;

export const getFilteredPaymentGateways = (
	paymentGateways: MightNotExist<PaymentGateway[]>,
): PaymentGateway[] => {
	if (!paymentGateways) {
		return [];
	}
	return compact(paymentGateways).filter(({ id }) =>
		supportedPaymentGateways.includes(id as (typeof supportedPaymentGateways)[number]),
	);
};

export const getUrlForTransactionInitialize = () => getUrl({ query: { processingPayment: true } });

export const usePaymentStatus = ({
	chargeStatus,
	authorizeStatus,
}: {
	chargeStatus: CheckoutChargeStatusEnum | OrderChargeStatusEnum;
	authorizeStatus: CheckoutAuthorizeStatusEnum | OrderAuthorizeStatusEnum;
}): PaymentStatus => {
	if (
		chargeStatus === CheckoutChargeStatusEnum.None &&
		authorizeStatus === CheckoutAuthorizeStatusEnum.Full
	) {
		return "authorized";
	}

	if (chargeStatus === CheckoutChargeStatusEnum.Full || chargeStatus === OrderChargeStatusEnum.Full) {
		return "paidInFull";
	}

	if (
		chargeStatus === CheckoutChargeStatusEnum.Overcharged ||
		chargeStatus === OrderChargeStatusEnum.Overcharged
	) {
		return "overpaid";
	}

	return "none";
};
