"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyCartPage } from "../EmptyCartPage";
import { PageNotFound } from "../PageNotFound";
import { useUser } from "../../hooks/useUser";
import { Summary, SummarySkeleton } from "@/checkout/sections/Summary";
import { CheckoutForm, CheckoutFormSkeleton } from "@/checkout/sections/CheckoutForm";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { CheckoutSkeleton } from "@/checkout/views/Checkout/CheckoutSkeleton";

export const Checkout = () => {
	const { checkout, fetching: fetchingCheckout, checkoutId } = useCheckout();
	const { loading: isAuthenticating } = useUser();
	const [passengerNames, setPassengerNames] = useState<string[]>([]);

	if (!checkoutId) {
		return <EmptyCartPage />;
	}

	const isCheckoutInvalid = !fetchingCheckout && !checkout && !isAuthenticating;
	const isInitiallyAuthenticating = isAuthenticating && !checkout;
	const isEmptyCart = checkout && !checkout.lines.length;

	return isCheckoutInvalid ? (
		<PageNotFound />
	) : isInitiallyAuthenticating ? (
		<CheckoutSkeleton />
	) : (
		<ErrorBoundary FallbackComponent={PageNotFound}>
			<div className="page">
				{isEmptyCart ? (
					<EmptyCartPage />
				) : (
					<div className="grid min-h-screen grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
						<Suspense fallback={<CheckoutFormSkeleton />}>
							<CheckoutForm onPassengerNamesChange={setPassengerNames} />
						</Suspense>
						<Suspense fallback={<SummarySkeleton />}>
							<Summary
								lines={checkout.lines}
								totalPrice={checkout.totalPrice}
								editable={true}
								voucherCode={checkout.voucherCode}
								giftCards={checkout.giftCards}
								shippingPrice={checkout.shippingPrice}
								discount={checkout.discount ?? undefined}
								passengerNames={passengerNames}
							/>
						</Suspense>
					</div>
				)}
			</div>
		</ErrorBoundary>
	);
};
